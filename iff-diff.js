import { xc } from 'xtal-element/lib/XtalCore.js';
/**
 * @element iff-diff
 */
export class IffDiff extends HTMLElement {
    constructor() {
        super(...arguments);
        //boilerplate
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
        this.self = this;
        this.evaluatedValue = false;
    }
    sysOfRecHandler(e) {
        const key = slicedPropDefs.propLookup.value.alias;
        this[key] = this.syncWith !== undefined ? e.detail.value : !e.detail.value;
    }
    disconnectedCallback() {
        this.disconnect();
    }
    disconnect() {
        const sys = this.sysOfRec?.deref();
        if (sys === undefined)
            return;
        sys.removeEventListener('value-changed', this.sysOfRecHandler);
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
const linkValue = ({ iff, lhs, rhs, includes, equals, notEquals, self, disabled }) => {
    if ((self.syncWith || self.antiSyncWith) !== undefined)
        return; // don't compute our own value
    const key = slicedPropDefs.propLookup.value.alias;
    const aSelf = self;
    let val = self.iff;
    if (val) {
        if (equals || notEquals) {
            let eq = false;
            if (typeof lhs === 'object' && typeof rhs === 'object') {
                import('./compare.js').then(({ compare }) => {
                    eq = compare(lhs, rhs);
                    aSelf[key] = equals ? eq : !eq;
                });
            }
            else {
                eq = lhs === rhs;
                aSelf[key] = equals ? eq : !eq;
            }
        }
        else if (includes) {
            import('./includes.js').then(({ includes }) => {
                aSelf[key] = includes(lhs, rhs);
            });
        }
    }
    else {
        aSelf[key] = !!val;
    }
    self.evaluatedValue = true;
    ;
};
const linkValueFromReference = ({ syncWith, antiSyncWith, self }) => {
    const union = syncWith || antiSyncWith;
    if (union === undefined)
        return;
    const sourceOfTruth = self.getRootNode().querySelector('#' + union);
    if (sourceOfTruth == null)
        throw syncWith + " not found.";
    self.disconnect();
    self.sysOfRec = new WeakRef(sourceOfTruth);
    const key = slicedPropDefs.propLookup.value.alias;
    self[key] = sourceOfTruth.value;
    sourceOfTruth.addEventListener('value-changed', self.sysOfRecHandler.bind(self));
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
    linkValueFromReference,
];
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
        obfuscate: true,
    },
    syncWith: str1, antiSyncWith: str1
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(IffDiff, slicedPropDefs, 'onPropChange');
xc.define(IffDiff);
