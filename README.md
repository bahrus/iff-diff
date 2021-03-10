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
<iff-diff iff -lhs equals -rhs set-attr="some-attribute" set-class="some-class" set-part="some-part"></iff-diff>
<div></div>
```

Other options to "equals" are "not-equals" and "includes".

lhs, rhs can be strings, numbers, or objects (in which case the two objects are compared recursively.)

## Advantages

If this component is used inside a (code-centric) library capable of "declaratively" setting attributes on the "owned" elements, does this component make sense?

In that scenario, the "benefits vs cost" question probably only comes close if using the feature where the lhs and rhs can be objects, and the comparison can be made recursively.

By far, this component makes most sense to use in a HTML-first environment, where the goal is to avoid "context-switching" into JavaScript as much as possible.  It benefits from the existence of other components capable of dynamically passing in the values of properties if, lhs, rhs, etc. declaratively.  For example, with [p-et-alia](https://github.com/bahrus/p-et-alia) or the smaller [on-to-me](https://github.com/bahrus/on-to-me) components:

```html
<ways-of-science>
    <largest-scale>
        <woman-with-carrot-attached-to-nose></woman-with-carrot-attached-to-nose>
    </largest-scale>
    <p-d on=value-changed to=[-lhs] m=1 val=target.value></p-d>
    <largest-scale>
        <a-duck></a-duck>
    </largest-scale>
    <p-d on=value-changed to=[-rhs] m=1 val=target.value></p-d>
    <iff-diff iff -lhs not-equals -rhs set-attr=hidden></iff-diff>
    <div hidden>A witch!</div>
</ways-of-science>
```

## Shared condition

Multiple iff-diffs can share the results of a single iff-diff instance:

```html
<iff-diff id=source-of-truth -iff -lhs -equals -rhs set-attr="some-attribute" set-class="some-class" set-part="some-part"></iff-diff>
<div></div>
...
<iff-diff sync-with=source-of-truth set-class="some-other-class"></iff-diff>
<span></span>
```

To share the negation of another if-diff instance:

```html
<iff-diff id=source-of-truth -iff -lhs -equals -rhs set-attr="some-attribute" set-class="some-class" set-part="some-part"></iff-diff>
<div></div>
...
<iff-diff anti-sync-with=source-of-truth set-class="some-other-class"></iff-diff>
<span></span>
```

Restrictions:  

1.  This only works for instances within the same ShadowDOM realm.
2.  The source-of-truth instance is guaranteed to be found if the source-of-truth instance comes before the referencing instance(s) in the document order.  This is most applicable when employing streaming.


