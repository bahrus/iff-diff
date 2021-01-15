import { define } from 'xtal-element/lib/define.js';
import { getPropDefs } from 'xtal-element/lib/getPropDefs.js';
import { letThereBeProps } from 'xtal-element/lib/letThereBeProps.js';
import { hydrate } from 'xtal-element/lib/hydrate.js';
import { Reactor } from 'xtal-element/lib/Reactor.js';
const propDefGetter = [
    ({ iff, equals, notEquals, includes, evaluatedValue }) => ({
        type: Boolean,
        dry: true,
        async: true,
    }),
    ({ disabled }) => ({
        type: Boolean,
        reflect: true
    }),
    ({ lhs, rhs }) => ({
        type: Object,
        dry: true,
        async: true,
    }),
    ({ setAttr, setClass, setPart }) => ({
        type: String,
        dry: true,
        async: true,
        stopReactionsIfFalsy: true
    }),
    ({ value }) => ({
        type: Boolean,
        dry: true,
        notify: true,
        reflect: true,
        async: true,
    }),
];
const propDefs = getPropDefs(propDefGetter);
const linkValue = ({ iff, lhs, rhs, includes, equals, notEquals, self, disabled }) => {
    let val = self.iff;
    if (val) {
        if (equals || notEquals) {
            let eq = false;
            if (typeof lhs === 'object' && typeof rhs === 'object') {
                import('./compare.js').then(({ compare }) => {
                    eq = compare(lhs, rhs);
                    self.value = equals ? eq : !eq;
                });
            }
            else {
                eq = lhs === rhs;
                self.value = equals ? eq : !eq;
            }
        }
        else if (includes) {
            import('./includes.js').then(({ includes }) => {
                self.value = includes(lhs, rhs);
            });
        }
    }
    else {
        self.value = !!val;
    }
    self.evaluatedValue = true;
    ;
};
const affectNextSibling = ({ self, value, setAttr, setClass, setPart, evaluatedValue }) => {
    if (!evaluatedValue)
        return;
    const ns = self.nextElementSibling;
    if (ns === null) {
        setTimeout(() => affectNextSibling(self), 50);
        return;
    }
    if (value) {
        if (setAttr !== undefined)
            ns.setAttribute(setAttr, '');
        if (setClass !== undefined)
            ns.classList.add(setClass);
        if (setPart !== undefined)
            ns.part.add(setPart);
    }
    else {
        if (setAttr !== undefined)
            ns.removeAttribute(setAttr);
        if (setClass !== undefined)
            ns.classList.remove(setClass);
        if (setPart !== undefined)
            ns.part.remove(setPart);
    }
};
const propActions = [
    linkValue,
    affectNextSibling,
];
export class IffDiff extends HTMLElement {
    constructor() {
        super(...arguments);
        //boilerplate
        this.propActions = propActions;
        this.reactor = new Reactor(this);
        this.self = this;
        this.evaluatedValue = false;
        /**
         * Computed based on values of  if / equals / not_equals / includes
         */
        this.value = false;
    }
    onPropChange(n, propDef, newVal) {
        this.reactor.addToQueue(propDef, newVal);
    }
    connectedCallback() {
        this.style.display = 'none';
        hydrate(this, propDefs);
    }
}
IffDiff.is = 'iff-diff';
letThereBeProps(IffDiff, propDefs, 'onPropChange');
define(IffDiff);
