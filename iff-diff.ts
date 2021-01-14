import {define} from 'xtal-element/lib/define.js';
import {destructPropInfo, PropDef, PropAction} from 'xtal-element/types.d.js';
import {getPropDefs} from 'xtal-element/lib/getPropDefs.js';
import {letThereBeProps} from 'xtal-element/lib/letThereBeProps.js';
import {hydrate} from 'xtal-element/lib/hydrate.js';
import {Reactor, ReactiveSurface} from 'xtal-element/lib/Reactor.js';


const propDefGetter = [
    ({iff, equals, notEquals, includes}: IffDiff) => ({
        type: Boolean,
        dry: true,
        async: true,
    }),
    ({lhs, rhs}: IffDiff) => ({
        type: Object,
        dry: true,
        async: true,
    }),
    ({setAttr, setClass, setPart}: IffDiff) => ({
        type: String,
        dry: true,
        async: true,
    }),
    ({value}: IffDiff) => ({
        type: Boolean,
        dry: true,
        notify: true,
        reflect: true,
        async: true,
    }),
    ({evaluatedCount}: IffDiff) => ({
        type: Number,
        reflect: true,
        async: true,
        dry: true,
    })
] as destructPropInfo[];
const propDefs = getPropDefs(propDefGetter);

const linkValue = ({iff, lhs, rhs, includes, equals, notEquals, self}: IffDiff) => {
    let val = self.iff;
    console.log(iff, lhs, rhs, includes, equals, notEquals);
    if(val){
        if(equals || notEquals){
            let eq = false;
            if(typeof lhs === 'object' && typeof rhs === 'object'){
                import('./compare.js').then(({compare}) => {
                    eq = compare(lhs, rhs);
                    self.value = equals ? eq : !eq;
                });
            }else{
                eq = lhs === rhs;
                self.value = equals ? eq : !eq;
            }
        }else if(includes){
            import('./includes.js').then(({includes}) => {
                self.value = includes(lhs, rhs);
            });
        }
    }else{
        self.value = !!val;
    }
    self.evaluatedCount++;
};

const affectNextSibling = ({self, value, setAttr, setClass, setPart, evaluatedCount}: IffDiff) => {
    if(evaluatedCount === 0) return;
    console.log(value, setAttr, setClass, setPart, evaluatedCount);
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

export class IffDiff extends HTMLElement implements ReactiveSurface{
    static is = 'iff-diff';

    //boilerplate
    propActions = propActions; reactor = new Reactor(this); self=this;

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

    
    evaluatedCount: number = 0;

    /**
     * Computed based on values of  if / equals / not_equals / includes 
     */
    value: boolean = false;

    onPropChange(n: string, propDef: PropDef, newVal: any){
        this.reactor.addToQueue(propDef, newVal);
    }

    connectedCallback(){
        this.style.display = 'none';
        hydrate(this, propDefs);
    }

}
letThereBeProps(IffDiff, propDefs, 'onPropChange');
define(IffDiff);

declare global {
    interface HTMLElementTagNameMap {
        "iff-diff": IffDiff,
    }
}