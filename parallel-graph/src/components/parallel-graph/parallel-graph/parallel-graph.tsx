import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'parallel-graph',
  styleUrl: 'parallel-graph.css',
  shadow: true,
})
export class ParallelGraph {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
