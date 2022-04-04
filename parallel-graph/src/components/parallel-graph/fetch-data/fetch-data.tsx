import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'fetch-data',
  styleUrl: 'fetch-data.css',
  shadow: true,
})
export class FetchData {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
