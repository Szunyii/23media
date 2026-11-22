// WebMCP declarative API: the attributes that turn a <form> into a tool an
// in-browser AI agent can fill (https://webmachinelearning.github.io/webmcp/).
// React passes unknown lowercase attributes through to the DOM; this only
// teaches TypeScript about them.
import "react";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface FormHTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
    toolautosubmit?: boolean;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface InputHTMLAttributes<T> {
    toolparamdescription?: string;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TextareaHTMLAttributes<T> {
    toolparamdescription?: string;
  }
}
