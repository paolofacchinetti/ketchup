import {
    Component,
    Element,
    forceUpdate,
    h,
    Host,
    Method,
    Prop,
    State,
} from '@stencil/core';
import { KupComponent } from '../../types/GenericTypes';
import {
    KupManager,
    kupManagerInstance,
} from '../../utils/kup-manager/kup-manager';

@Component({
    tag: 'kup-probe',
    shadow: true,
})
export class KupProbe {
    /**
     * References the root HTML element of the component (<kup-probe>).
     */
    @Element() rootElement: HTMLElement;

    /*-------------------------------------------------*/
    /*                   S t a t e s                   */
    /*-------------------------------------------------*/

    /**
     * Lifecycle time.
     * @default null
     */
    @State() content: string = null;

    /*-------------------------------------------------*/
    /*                    P r o p s                    */
    /*-------------------------------------------------*/

    /**
     * Custom style of the component.
     * @default ""
     * @see https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() customStyle: string = '';
    /**
     * Specify features to test.
     * @default ""
     * @see https://ketchup.smeup.com/ketchup-showcase/#/customization
     */
    @Prop() features: {
        debug: boolean;
        language: boolean;
        longCycleProp: boolean;
        longCycleVar: boolean;
        theme: boolean;
    } = {
        debug: false,
        language: false,
        longCycleProp: false,
        longCycleVar: false,
        theme: false,
    };
    /**
     * Uncomment the code below to test render times with many props (100).
     */
    /*
    @Prop({ reflect: true }) test001 = 'null';
    @Prop({ reflect: true }) test002 = 'null';
    @Prop({ reflect: true }) test003 = 'null';
    @Prop({ reflect: true }) test004 = 'null';
    @Prop({ reflect: true }) test005 = 'null';
    @Prop({ reflect: true }) test006 = 'null';
    @Prop({ reflect: true }) test007 = 'null';
    @Prop({ reflect: true }) test008 = 'null';
    @Prop({ reflect: true }) test009 = 'null';
    @Prop({ reflect: true }) test010 = 'null';
    @Prop({ reflect: true }) test011 = 'null';
    @Prop({ reflect: true }) test012 = 'null';
    @Prop({ reflect: true }) test013 = 'null';
    @Prop({ reflect: true }) test014 = 'null';
    @Prop({ reflect: true }) test015 = 'null';
    @Prop({ reflect: true }) test016 = 'null';
    @Prop({ reflect: true }) test017 = 'null';
    @Prop({ reflect: true }) test018 = 'null';
    @Prop({ reflect: true }) test019 = 'null';
    @Prop({ reflect: true }) test020 = 'null';
    @Prop({ reflect: true }) test021 = 'null';
    @Prop({ reflect: true }) test022 = 'null';
    @Prop({ reflect: true }) test023 = 'null';
    @Prop({ reflect: true }) test024 = 'null';
    @Prop({ reflect: true }) test025 = 'null';
    @Prop({ reflect: true }) test026 = 'null';
    @Prop({ reflect: true }) test027 = 'null';
    @Prop({ reflect: true }) test028 = 'null';
    @Prop({ reflect: true }) test029 = 'null';
    @Prop({ reflect: true }) test030 = 'null';
    @Prop({ reflect: true }) test031 = 'null';
    @Prop({ reflect: true }) test032 = 'null';
    @Prop({ reflect: true }) test033 = 'null';
    @Prop({ reflect: true }) test034 = 'null';
    @Prop({ reflect: true }) test035 = 'null';
    @Prop({ reflect: true }) test036 = 'null';
    @Prop({ reflect: true }) test037 = 'null';
    @Prop({ reflect: true }) test038 = 'null';
    @Prop({ reflect: true }) test039 = 'null';
    @Prop({ reflect: true }) test040 = 'null';
    @Prop({ reflect: true }) test041 = 'null';
    @Prop({ reflect: true }) test042 = 'null';
    @Prop({ reflect: true }) test043 = 'null';
    @Prop({ reflect: true }) test044 = 'null';
    @Prop({ reflect: true }) test045 = 'null';
    @Prop({ reflect: true }) test046 = 'null';
    @Prop({ reflect: true }) test047 = 'null';
    @Prop({ reflect: true }) test048 = 'null';
    @Prop({ reflect: true }) test049 = 'null';
    @Prop({ reflect: true }) test050 = 'null';
    @Prop({ reflect: true }) test051 = 'null';
    @Prop({ reflect: true }) test052 = 'null';
    @Prop({ reflect: true }) test053 = 'null';
    @Prop({ reflect: true }) test054 = 'null';
    @Prop({ reflect: true }) test055 = 'null';
    @Prop({ reflect: true }) test056 = 'null';
    @Prop({ reflect: true }) test057 = 'null';
    @Prop({ reflect: true }) test058 = 'null';
    @Prop({ reflect: true }) test059 = 'null';
    @Prop({ reflect: true }) test060 = 'null';
    @Prop({ reflect: true }) test061 = 'null';
    @Prop({ reflect: true }) test062 = 'null';
    @Prop({ reflect: true }) test063 = 'null';
    @Prop({ reflect: true }) test064 = 'null';
    @Prop({ reflect: true }) test065 = 'null';
    @Prop({ reflect: true }) test066 = 'null';
    @Prop({ reflect: true }) test067 = 'null';
    @Prop({ reflect: true }) test068 = 'null';
    @Prop({ reflect: true }) test069 = 'null';
    @Prop({ reflect: true }) test070 = 'null';
    @Prop({ reflect: true }) test071 = 'null';
    @Prop({ reflect: true }) test072 = 'null';
    @Prop({ reflect: true }) test073 = 'null';
    @Prop({ reflect: true }) test074 = 'null';
    @Prop({ reflect: true }) test075 = 'null';
    @Prop({ reflect: true }) test076 = 'null';
    @Prop({ reflect: true }) test077 = 'null';
    @Prop({ reflect: true }) test078 = 'null';
    @Prop({ reflect: true }) test079 = 'null';
    @Prop({ reflect: true }) test080 = 'null';
    @Prop({ reflect: true }) test081 = 'null';
    @Prop({ reflect: true }) test082 = 'null';
    @Prop({ reflect: true }) test083 = 'null';
    @Prop({ reflect: true }) test084 = 'null';
    @Prop({ reflect: true }) test085 = 'null';
    @Prop({ reflect: true }) test086 = 'null';
    @Prop({ reflect: true }) test087 = 'null';
    @Prop({ reflect: true }) test088 = 'null';
    @Prop({ reflect: true }) test089 = 'null';
    @Prop({ reflect: true }) test090 = 'null';
    @Prop({ reflect: true }) test091 = 'null';
    @Prop({ reflect: true }) test092 = 'null';
    @Prop({ reflect: true }) test093 = 'null';
    @Prop({ reflect: true }) test094 = 'null';
    @Prop({ reflect: true }) test095 = 'null';
    @Prop({ reflect: true }) test096 = 'null';
    @Prop({ reflect: true }) test097 = 'null';
    @Prop({ reflect: true }) test098 = 'null';
    @Prop({ reflect: true }) test099 = 'null';
    @Prop({ reflect: true }) test100 = 'null';
    */
    /*-------------------------------------------------*/
    /*       I n t e r n a l   V a r i a b l e s       */
    /*-------------------------------------------------*/

    /**
     * Instance of the KupManager class.
     */
    private kupManager: KupManager = kupManagerInstance();
    /**
     * Start performance.now()
     */
    private startTime: number = performance.now();
    /**
     * End performance.now()
     */
    private endTime: number = null;

    /*-------------------------------------------------*/
    /*           P u b l i c   M e t h o d s           */
    /*-------------------------------------------------*/

    /**
     * This method is used to trigger a new render of the component.
     */
    @Method()
    async printLifecycleTime(): Promise<{ id: string; time: number }> {
        const time: number = this.endTime - this.startTime;
        this.content =
            this.rootElement.tagName +
            '#' +
            this.rootElement.id +
            ' took ' +
            time +
            'ms to render.';
        return { id: this.rootElement.id, time: time };
    }
    /**
     * This method is used to trigger a new render of the component.
     */
    @Method()
    async refresh(): Promise<void> {
        forceUpdate(this);
    }

    /*-------------------------------------------------*/
    /*           P r i v a t e   M e t h o d s         */
    /*-------------------------------------------------*/

    private longCycleProp() {
        let b: string = null;
        for (let index = 0; index < 1000000; index++) {
            b = this.customStyle;
        }
    }

    private longCycleVar() {
        const a: string = this.customStyle;
        let b: string = null;
        for (let index = 0; index < 1000000; index++) {
            b = a;
        }
    }

    /*-------------------------------------------------*/
    /*          L i f e c y c l e   H o o k s          */
    /*-------------------------------------------------*/

    componentWillLoad() {
        if (this.features.debug) {
            this.kupManager.debug.logLoad(this, false);
        }
        if (this.features.language) {
            this.kupManager.language.register(this);
        }
        if (this.features.longCycleProp) {
            this.longCycleProp();
        }
        if (this.features.longCycleVar) {
            this.longCycleVar();
        }
        if (this.features.theme) {
            this.kupManager.theme.register(this);
        }
    }

    componentDidLoad() {
        if (this.features.debug) {
            this.kupManager.debug.logLoad(this, true);
        }
        this.endTime = performance.now();
    }

    componentWillRender() {
        if (this.features.debug) {
            this.kupManager.debug.logRender(this, false);
        }
    }

    componentDidRender() {
        if (this.features.debug) {
            this.kupManager.debug.logRender(this, true);
        }
    }

    render() {
        let customStyle: string = null;

        if (this.features.theme) {
            customStyle = this.kupManager.theme.setCustomStyle(
                this.rootElement as KupComponent
            );
        }

        return (
            <Host>
                {customStyle ? <style>{customStyle}</style> : null}
                <div id="kup-component">{this.content}</div>
            </Host>
        );
    }

    disconnectedCallback() {
        if (this.features.language) {
            this.kupManager.language.unregister(this);
        }
        if (this.features.theme) {
            this.kupManager.theme.unregister(this);
        }
    }
}