const implementation = require('./3and4barPlay');

describe("3and4barPlay Unit Tests", () => {
    it('init', async () => {
        expect(true).toBe(true);
    });

    it('processMinAggs', async () => {
        expect(true).toBe(true);
    });

    it('incrementBars', async () => {
        expect(true).toBe(true);
    });

    it('is3BarPlay', async () => {
        expect(true).toBe(true);
    });

    it('is4BarPlay', async () => {
        expect(true).toBe(true);
    });

    it('checkBars', async () => {
        const testBars = [{"test1": "val1", "test2": "val2"}];
        const response = implementation.checkBars(testBars);
        expect(response).toBe(true);
    });
});