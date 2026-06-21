import PusherClient from "pusher-js";

let pusherClient: any = null;

if (typeof window !== "undefined") {
  pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_KEY || "",
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
      authEndpoint: "/api/pusher/auth",
    }
  );
}

export { pusherClient };
