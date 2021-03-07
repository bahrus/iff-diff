import {xc, PropAction, ReactiveSurface, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';

/**
 * @element iff-diff
 */
 export class IffDiff extends HTMLElement implements ReactiveSurface{
    static is = 'iff-diff';

    disabled: boolean | undefined;

    //boilerplate
    propActions = propActions; reactor = new xc.Rx(this); self=this;

    /**
     * Boolean property / attribute -- must be true to pass test(s)
     * @attr
     */
    iff: boolean | undefined;

    /**
     * LHS Operand.
     * @attr
     */
    lhs!: boolean | string | number | object;

    /**
     * RHS Operand.
     * @attr
     */
    rhs!: boolean | string | number | object;

    /**
     * lhs must equal rhs to pass tests.
     * @attr
     */
    equals!: boolean;

    /**
     * lhs must not equal rhs to pass tests.
     * @attr not-equals
     */
    notEquals: boolean | undefined;

    /**
     * For strings, this means lhs.indexOf(rhs) > -1
     * For arrays, this means lhs intersect rhs = rhs
     * For numbers, this means lhs >= rhs
     * For objects, this means all the properties of rhs match the same properties of lhs
     * @attr includes
     */
    includes!: boolean;


    setAttr: string | undefined;

    setClass: string | undefined;

    setPart: string | undefined;

    
    evaluatedValue: boolean = false;

    /**
     * Computed based on values of  if / equals / not_equals / includes 
     */
    value: boolean = false;

    onPropChange(n: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }

    connectedCallback(){
        this.style.display = 'none';
        xc.hydrate(this, slicedPropDefs);
    }

}


const linkValue = ({iff, lhs, rhs, includes, equals, notEquals, self, disabled}: IffDiff) => {
    const key = slicedPropDefs.propLookup.value!.alias!;
    const aSelf = self as any;
    let val = self.iff;
    if(val){
        if(equals || notEquals){
            let eq = false;
            if(typeof lhs === 'object' && typeof rhs === 'object'){
                import('./compare.js').then(({compare}) => {
                    eq = compare(lhs, rhs);
                    aSelf[key] = equals ? eq : !eq;
                });
            }else{
                eq = lhs === rhs;
                aSelf[key] = equals ? eq : !eq;
            }
        }else if(includes){
            import('./includes.js').then(({includes}) => {
                aSelf[key] = includes(lhs, rhs);
            });
        }
    }else{
        aSelf[key] = !!val;
    }
    self.evaluatedValue = true;;
};

const affectNextSibling = ({self, value, setAttr, setClass, setPart, evaluatedValue}: IffDiff) => {
    if(!evaluatedValue) return;
    const ns = self.nextElementSibling;
    if(ns ===  null){
        setTimeout(() => affectNextSibling(self), 50);
        return;
    }
    if(value){
        if(setAttr !== undefined) ns.setAttribute(setAttr, '');
        if(setClass !== undefined) ns.classList.add(setClass);
        if(setPart !== undefined) (<any>ns).part.add(setPart);
    }else{
        if(setAttr !== undefined) ns.removeAttribute(setAttr);
        if(setClass !== undefined) ns.classList.remove(setClass);
        if(setPart !== undefined) (<any>ns).part.remove(setPart);
    }

}

const propActions = [
    linkValue,
    affectNextSibling,
] as PropAction[];


const bool1: PropDef = {
    type: Boolean,
    dry: true,
    async: true,
};
const obj1: PropDef = {
    type: Object,
    dry: true,
    async: true,
};
const str1: PropDef = {
    type: String,
    dry: true,
    async: true,
    stopReactionsIfFalsy: true
};
const propDefMap: PropDefMap<IffDiff> = {
    iff: bool1, notEquals: bool1, includes: bool1, evaluatedValue: bool1,
    disabled: {
        type: Boolean,
        reflect: true,
    },
    lhs: obj1, rhs: obj1,
    setAttr: str1, setClass: str1, setPart: str1,
    value:{
        type: Boolean,
        dry: true,
        notify: true,
        reflect: true,
        async: true,
        obfuscate: true,
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);

xc.letThereBeProps(IffDiff, slicedPropDefs, 'onPropChange');
xc.define(IffDiff);

declare global {
    interface HTMLElementTagNameMap {
        "iff-diff": IffDiff,
    }
}