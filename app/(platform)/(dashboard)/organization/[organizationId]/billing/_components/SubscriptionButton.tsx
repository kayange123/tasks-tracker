"use client";

import { stripeRedirect } from "@/actions/stripe-redirect/action";
import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/useActions";
import { useProModal } from "@/hooks/useProModal";
import { notify } from "@/lib/notify";

interface SubscriptionButtonProps {
  isPro: boolean;
}

const SubscriptionButton = ({ isPro }: SubscriptionButtonProps) => {
  const proModal = useProModal();
  const { execute, isLoading } = useAction(stripeRedirect, {
    onSuccess: (data) => {
      notify.loading("Redirecting to Stripe…", {
        description: "Opening the billing portal.",
      });
      window.location.href = data;
    },
    onError: (error) => {
      notify.error(error);
    },
  });

  const onClick = () => {
    if (isPro) {
      execute({});
    } else {
      proModal.onOpen();
    }
  };
  return (
    <Button onClick={onClick} disabled={isLoading}>
      {isLoading
        ? "Opening…"
        : isPro
          ? "Manage subscription"
          : "Upgrade to Pro"}
    </Button>
  );
};

export default SubscriptionButton;
