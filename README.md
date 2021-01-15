<a href="https://nodei.co/npm/iff-diff/"><img src="https://nodei.co/npm/iff-diff.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/iff-diff">

# iff-diff


iff-diff is a simplified version of [if-diff](https://github.com/bahrus/if-diff).  Iff-diff only affects its next sibling.

iff-diff supports setting (or removing) an attribute, a class, and/or a part from that next sibling.  That is all.

iff-diff might be used in combination with a lazy loading component, like [laissez-dom](https://github.com/bahrus/laissez-dom).

## Example Syntax

```html
<!-- p-et-alia notation -->
<iff-diff -if -lhs -equals -rhs set-attr="some-attribute" set-class="some-class" set-part="some-part"></iff-diff>
<div></div>
```

Other options to "equals" are "not-equals" and "includes".

lhs, rhs can be strings, numbers, or objects (in which case the two objects are compared recursively.)

