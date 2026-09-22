import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";

// Node.js 20 does not provide a native WebSocket implementation. Expo Router
// renders routes on the server as well, so provide one only for that runtime.
const realtime =
  typeof window === "undefined"
    ? { transport: require("ws") }
    : undefined;

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  { realtime },
);
