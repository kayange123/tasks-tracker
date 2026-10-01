"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useProModal } from "@/hooks/useProModal";
import Image from "next/image";
import { Button } from "../ui/button";
import { useAction } from "@/hooks/useActions";
import { stripeRedirect } from "@/actions/stripe-redirect/action";
import { notify } from "@/lib/notify";

const ProModal = () => {
  const proModal = useProModal();

  const { execute, isLoading } = useAction(stripeRedirect, {
    onSuccess(data) {
      notify.loading("Redirecting to Stripe…", {
        description: "Opening secure checkout.",
      });
      window.location.href = data;
    },
    onError(error) {
      notify.error(error);
    },
  });

  const onClick = () => {
    execute({});
  };
  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="aspect-video relative flex items-center justify-center">
          <Image
            src={"/hero.svg"}
            alt="hero image"
            fill
            className="object-cover"
          />
        </div>
        <div className="text-neutral-700 mx-auto space-y-6 p-6">
          <h2 className="font-semibold text-xl">
            Upgrade to Pro to unlock all features
          </h2>
          <p className="text-xs font-semibold text-neutral-600">
            Explore the best of our features and get unlimited access to all
          </p>
          <div className="pl-3">
            <ul className="text-sm list-disc">
              <li>Unlimited boards</li>
              <li>Advanced features</li>
              <li>Admin and Security</li>
              <li>And much more...</li>
            </ul>
          </div>
          <Button
            onClick={onClick}
            disabled={isLoading}
            className="w-full"
            variant="primary"
          >
            {isLoading ? "Loading..." : "Upgrade to Pro"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProModal;
