import { xc } from 'xtal-element/lib/XtalCore.js';
const bool1 = {
    type: Boolean,
    dry: true,
    async: true,
};
const obj1 = {
    type: Object,
    dry: true,
    async: true,
};
const str1 = {
    type: String,
    dry: true,
    async: true,
    stopReactionsIfFalsy: true
};
const propDefMap = {
    iff: bool1, notEquals: bool1, includes: bool1, evaluatedValue: bool1,
    disabled: {
        type: Boolean,
        reflect: true,
    },
    lhs: obj1, rhs: obj1,
    setAttr: str1, setClass: str1, setPart: str1,
    value: {
        type: Boolean,
        dry: true,
        notify: true,
        reflect: true,
        async: true,
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
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
        this.reactor = new xc.Reactor(this);
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
        xc.hydrate(this, slicedPropDefs);
    }
}
IffDiff.is = 'iff-diff';
xc.letThereBeProps(IffDiff, slicedPropDefs.propDefs, 'onPropChange');
xc.define(IffDiff);
