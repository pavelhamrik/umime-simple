export const Test = (function() {
    const a = 2;

    function hi() {
        console.log(a);
    }

    return {
        'hi': hi,
    }
})();