<a href="https://nodei.co/npm/iff-diff/"><img src="https://nodei.co/npm/iff-diff.png"></a>

<img src="https://badgen.net/bundlephobia/minzip/iff-diff">

# iff-diff


iff-diff is a simplified version of [if-diff](https://github.com/bahrus/if-diff).  iff-diff only affects its next sibling.

iff-diff supports setting (or removing) an attribute, a class, and/or a part from that next sibling, depending on the specified condition.  

That is all.

iff-diff might be used in combination with a lazy loading component, like [laissez-dom](https://github.com/bahrus/laissez-dom) or [lazy-mt](https://github.com/bahrus/lazy-mt).

## Example Syntax

```html
<!-- p-et-alia notation -->
<iff-diff -if -lhs -equals -rhs set-attr="some-attribute" set-class="some-class" set-part="some-part"></iff-diff>
<div></div>
```

Other options to "equals" are "not-equals" and "includes".

lhs, rhs can be strings, numbers, or objects (in which case the two objects are compared recursively.)

## Advantages

If this component is used inside a (code-centric) library capable of "declaratively" setting attributes on the "owned" elements, does this component make sense?

In that scenario, the "benefits vs cost" question probably only comes out on top if using the feature where the lhs and rhs can be objects, and the comparison can be made recursively.

This component makes most sense to use in a HTML-first environment, where the goal is to avoid "context-switching" into JavaScript as much as possible.  It benefits from the existence of other components capable of dynamically passing in the values of properties if, lhs, equals, rhs declaratively.  For example, with [p-et-alia](https://github.com/bahrus/p-et-alia) or the smaller [on-to-me](https://github.com/bahrus/on-to-me) components:

```html
<ways-of-science>
    <weight-scale>
        <woman-with-carrot-attached-to-nose></woman-with-carrot-attached-to-nose>
    </weight-scale>
    <p-d on=value-changed to=[-lhs] m=1 val=target.value></p-d>
    <weight-scale>
        <a-duck></a-duck>
    <weight-scale>
    <p-d on=value-changed to=[-rhs] m=1 val=target.value></p-d>
    <iff-diff if -lhs not-equals -rhs set-attr=hidden></iff-diff>
    <div hidden>A witch!</div>
</ways-of-science>
```

## Shared condition

Multiple iff-diffs can share the results of a single iff-diff instance:

```html
<iff-diff id=source-of-truth -if -lhs -equals -rhs set-attr="some-attribute" set-class="some-class" set-part="some-part"></iff-diff>
<div></div>
...
<iff-diff sync-with=source-of-truth set-class="some-other-class"></iff-diff>
<span></span>
```

To share the negation of another if-diff instance[TODO]:

```html
<iff-diff id=source-of-truth -if -lhs -equals -rhs set-attr="some-attribute" set-class="some-class" set-part="some-part"></iff-diff>
<div></div>
...
<iff-diff sync-with-not=source-of-truth set-class="some-other-class"></iff-diff>
<span></span>
```

Restrictions:  

1.  This only works for instances within the same ShadowDOM realm.


