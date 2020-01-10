import { Fragment, h, JSX } from "preact";
import { Dict } from "./helpers";

export interface Parameter<NAMES extends string> {
  name: NAMES;
}

type MessageComponent<NAMES extends string> = string | Parameter<NAMES>;
type ParamsDict<NAMES extends string, V> = Dict<NAMES, V>;

export interface Message<NAMES extends string> {
  components: MessageComponent<NAMES>[];
}

export function p<NAMES extends string>(
  parameterName: NAMES,
): Parameter<NAMES> {
  return {
    name: parameterName,
  };
}

export function m<NAMES extends string>(
  parts: TemplateStringsArray,
  ...params: Parameter<NAMES>[]
): Message<NAMES> {
  const components: MessageComponent<NAMES>[] = [];
  for (let i = 0; i < parts.raw.length; i += 1) {
    const part = parts.raw[i];
    components.push(part);
    if (i < params.length) {
      components.push(params[i]);
    }
  }
  return {
    components,
  };
}

export function evaluate<NAMES extends string, R>(
  message: Message<NAMES>,
  params: ParamsDict<NAMES, R>,
): (string | R)[] {
  return message.components.map(component =>
    typeof component === "string" ? component : params[component.name],
  );
}

export function evaluate2<NAMES extends string, R>(
  message: Message<NAMES>,
  params: ParamsDict<NAMES, R>,
): (string | R)[] {
  return message.components.map(component =>
    typeof component === "string" ? component : params[component.name],
  );
}

export function UIMessage<NAMES extends string>(props: {
  children: Message<NAMES>;
  params: ParamsDict<NAMES, JSX.Element>;
}): JSX.Element {
  return (
    <Fragment>
      {evaluate(props.children, props.params).map((x, i) => (
        <Fragment key={i}>{x}</Fragment>
      ))}
    </Fragment>
  );
}
