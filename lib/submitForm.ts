import type { FormEvent } from "react";

// React 19 resets uncontrolled fields once a function `action` resolves,
// and our actions resolve with validation errors instead of throwing, so
// a failed submit would wipe what the user typed. Submitting through
// onSubmit keeps the fields; callers track pending state via useAction.
export const submitForm =
  (handler: (form: FormData) => void) =>
  (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handler(new FormData(event.currentTarget));
  };
