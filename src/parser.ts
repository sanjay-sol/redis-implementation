
type Command = {
  name: string;
  args: string[];
};

export function parse(data: string): Command {
  const parts = data.trim().split(" ");
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);
  return { name, args };
}
