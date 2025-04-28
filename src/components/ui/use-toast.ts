
// This file forwards the hooks from the hooks directory to maintain backwards compatibility
// This prevents circular dependencies between UI components and hooks
import { useToast, toast } from "@/hooks/use-toast";

export { useToast, toast };
