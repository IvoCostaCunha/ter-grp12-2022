/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
export namespace Components {
    interface D3jsWebComponent {
    }
}
declare global {
    interface HTMLD3jsWebComponentElement extends Components.D3jsWebComponent, HTMLStencilElement {
    }
    var HTMLD3jsWebComponentElement: {
        prototype: HTMLD3jsWebComponentElement;
        new (): HTMLD3jsWebComponentElement;
    };
    interface HTMLElementTagNameMap {
        "d3js-web-component": HTMLD3jsWebComponentElement;
    }
}
declare namespace LocalJSX {
    interface D3jsWebComponent {
    }
    interface IntrinsicElements {
        "d3js-web-component": D3jsWebComponent;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "d3js-web-component": LocalJSX.D3jsWebComponent & JSXBase.HTMLAttributes<HTMLD3jsWebComponentElement>;
        }
    }
}