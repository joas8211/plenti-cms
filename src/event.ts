type Listener<THIS, INPUTS extends unknown[], OUTPUT> = (
  this: THIS,
  ...values: INPUTS
) => OUTPUT | Promise<OUTPUT>;

interface Node<THIS, INPUTS extends unknown[], OUTPUT> {
  listener: Listener<THIS, INPUTS, OUTPUT>;
  previous: Node<THIS, INPUTS, OUTPUT> | null;
  next: Node<THIS, INPUTS, OUTPUT> | null;
}

export function createEvent<THIS, INPUTS extends unknown[] = [], OUTPUT = void>(
  self: THIS,
) {
  let first: Node<THIS, INPUTS, OUTPUT> | null = null;
  let last: Node<THIS, INPUTS, OUTPUT> | null = null;
  return {
    subscribe: (listener: Listener<THIS, INPUTS, OUTPUT>) => {
      const node: Node<THIS, INPUTS, OUTPUT> = {
        listener,
        previous: last,
        next: null,
      };
      if (!first) {
        first = node;
      }
      if (last) {
        last.next = node;
      }
      last = node;

      return () => {
        if (node.previous) {
          node.previous.next = node.next;
        }
        if (node.next) {
          node.next.previous = node.previous;
        }
        if (node == first) {
          first = node.next;
        }
        if (node == last) {
          last = node.previous;
        }
      };
    },
    trigger: async (...values: INPUTS) => {
      let node = first;
      const output: OUTPUT[] = [];
      while (node) {
        output.push(await node.listener.call(self, ...values));
        node = node.next;
      }
      return output;
    },
  };
}
