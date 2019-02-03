'use strict';

import Cookies from 'js-cookie';
import {weightedRandomFromArr} from '../gridcross/utils';

const DEFAULT_COOKIE_EXPIRATION = 30;

class GAUtils {
    static sendEvent(params) {
        if (typeof ga === 'undefined') return;

        const {category = 'Interactions', action = 'Default', label = '', value = 0, nonInteraction = false} = params;
        ga('send', 'event', category, action, label, value, {nonInteraction: nonInteraction});
    }

    static sendPageView() {
        if (typeof ga === 'undefined') return;

        ga('send', 'pageview');
    }

    static createTest(params) {
        const {name = '', variants = [], id = ''} = params;

        if (name === '' || id === '') {
            if (LOG) console.error(`Test ID and name must be specified`);
            return;
        }

        if (variants.length < 2) {
            if (LOG) console.error(`The number of test variants must be 2 or bigger`);
            return;
        }

        if (typeof Cookies.get(`ab-${name}-id`) === 'undefined') {
            // const variant = Math.round(Math.random() * (variants - 1));
            const variant = weightedRandomFromArr(variants).label;

            if (LOG) console.log(
                `%cSetting test variant cookies:\nab-${name}-variant = ${variant}\nab-${name}-id = ${id}`,
                'color: burlywood'
            );
            Cookies.set(`ab-${name}-id`, id, {expires: DEFAULT_COOKIE_EXPIRATION});
            Cookies.set(`ab-${name}-variant`, variant, {expires: DEFAULT_COOKIE_EXPIRATION});
        }
    }

    static getTestVariant(name, send = true) {
        const testName = `ab-${name}`;
        const testVariant = Cookies.get(`${testName}-variant`);
        const testID = Cookies.get(`${testName}-id`);

        if (typeof testVariant !== 'undefined' && typeof testID !== 'undefined' && typeof ga !== 'undefined') {
            const variant = parseInt(testVariant, 2);

            ga('set', 'exp', `${testID}.${variant}`);

            if (send) {
                this.sendEvent({
                    category: 'A/B Tests',
                    action: testName,
                    label: `Variant ${variant}`,
                    // value: variant,
                    nonInteraction: true,
                });
            }

            return variant;
        }
        return undefined;
    }
}

export default GAUtils;