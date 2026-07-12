export function getTimeSensitiveGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greeting: string;

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  return name ? `${greeting}, ${name}` : greeting;
}

export function formatHeaderDate(date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
