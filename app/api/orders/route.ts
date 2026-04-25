import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { stripe } from "@/lib/stripe";
import { Cart } from "@/models/cart";
import { Order } from "@/models/order";
import { addressSchema } from "@/schemas/order";
import { NextRequest, NextResponse } from "next/server";
import { ProductType } from "@/models/products";

interface PopulatedCartItem {
  productId: ProductType;
  quantity: number;
}

interface PopulatedCart {
  items: PopulatedCartItem[];
}

export const POST = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { address } = await req.json();
    const userId = req.headers.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    try {
      const data = await addressSchema.parseAsync(address);
      const cart = (await Cart.findOne({ userId }).populate(
        "items.productId",
      )) as unknown as PopulatedCart;
      if (!cart || cart.items.length < 1) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 404 });
      }

      const totalPrice = cart.items.reduce(
        (acc: number, item: PopulatedCartItem) =>
          acc + Number(item?.productId?.price || 0) * (item.quantity || 1),
        0,
      );

      // Create the order first (pending status)
      const order = await Order.create({
        userId,
        address: data,
        items: cart.items.map((item: PopulatedCartItem) => ({
          productId: item.productId._id,
          quantity: item.quantity || 1,
          price: item.productId?.price || 0,
        })),
        totalPrice,
        status: "pending",
      });

      // Create Stripe checkout session — link it to the order via metadata
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: cart.items.map((item: PopulatedCartItem) => ({
          quantity: item.quantity || 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: item?.productId?.name || "Product",
              description: item?.productId?.description?.slice(0, 200) || "",
              images: Array.isArray(item?.productId?.images)
                ? item.productId.images.filter((img: string) =>
                    img?.startsWith("http"),
                  )
                : [],
            },
            unit_amount: Math.round(Number(item?.productId?.price || 0) * 100),
          },
        })),
        mode: "payment",
        success_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.nextUrl.origin}/cart`,
        metadata: {
          orderId: order._id.toString(),
          userId,
        },
      });

      if (!session?.url) {
        // Roll back order if Stripe session fails
        await Order.findByIdAndDelete(order._id);
        return NextResponse.json(
          { error: "Failed to create checkout session" },
          { status: 500 },
        );
      }

      // Save the stripe session id on the order for webhook lookup
      await Order.findByIdAndUpdate(order._id, { stripeSessionId: session.id });

      // Clear the cart
      await Cart.findOneAndUpdate({ userId }, { items: [] });

      return NextResponse.json({
        message: "Order created — redirecting to checkout",
        orderId: order._id,
        sessionUrl: session.url,
      });
    } catch (error: unknown) {
      console.error("Order creation error:", error);
      return NextResponse.json(
        { error: (error as Error)?.message || "Failed to create order" },
        { status: 500 },
      );
    }
  },
);

export const GET = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = req.headers.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    try {
      const orders = await Order.find({
        userId,
        ...(status ? { status } : {}),
      })
        .populate("items.productId")
        .sort({ createdAt: -1 });

      return NextResponse.json({ orders });
    } catch (error: unknown) {
      console.error("Order fetch error:", error);
      return NextResponse.json(
        { error: (error as Error)?.message || "Failed to fetch orders" },
        { status: 500 },
      );
    }
  },
);
