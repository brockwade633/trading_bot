const implementation = require('./3and4barPlay');

describe("3and4barPlay Unit Tests", () => {
    it('init', async () => {
        // ToDo: Mock secrets manager and test that client and bars have been hydrated
    });

    it.skip('processMinAggs', async () => {
        // This is tested by WS for now
    });

    it('incrementBars', async () => {
        // ToDo
    });

    it('is3BarPlay', async () => {
        // ToDo
    });

    it('is4BarPlay', async () => {
        // ToDo
    });

    it('checkBars', async () => {
        const testBars = [{"test1": "val1", "test2": "val2"}];
        const response = implementation.checkBars(testBars);
        expect(response).toBe(true);
    });
});