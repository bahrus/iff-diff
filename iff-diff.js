import { define } from 'xtal-element/lib/define.js';
import { getPropDefs } from 'xtal-element/lib/getPropDefs.js';
import { letThereBeProps } from 'xtal-element/lib/letThereBeProps.js';
import { hydrate } from 'xtal-element/lib/hydrate.js';
import { Reactor } from 'xtal-element/lib/Reactor.js';
const propDefGetter = [
    ({ iff, equals, notEquals, includes }) => ({
        type: Boolean,
        dry: true,
        async: true,
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
    }),
    ({ value }) => ({
        type: Boolean,
        dry: true,
        notify: true,
        reflect: true,
        async: true,
    }),
    ({ evaluatedCount }) => ({
        type: Number,
        reflect: true,
        async: true,
        dry: true,
    })
];
const propDefs = getPropDefs(propDefGetter);
const linkValue = ({ iff, lhs, rhs, includes, equals, notEquals, self }) => {
    let val = self.iff;
    console.log(iff, lhs, rhs, includes, equals, notEquals);
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
    self.evaluatedCount++;
};
const affectNextSibling = ({ self, value, setAttr, setClass, setPart, evaluatedCount }) => {
    if (evaluatedCount === 0)
        return;
    console.log(value, setAttr, setClass, setPart, evaluatedCount);
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
        this.evaluatedCount = 0;
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
