let u = {};

u.C2M = (cID) => cID.split('-')[0];

u.collapseShares = function(sharesArray) {
    return sharesArray.reduce((acc, cur, i) => {
        const cID = cur.contractID;
        acc[cID] = (acc[cID] + cur.quantity) || cur.quantity;
        return acc;
    }, {});
};

u.expandShares = function(sharesObj) {
    return Object.keys(sharesObj).map((cID) => {
        return {
            contractID: cID,
            quantity: sharesObj[cID]
        };
    });
};

u.bestPrices = (offers) => {
    offers = offers || [];
    if (offers.hasOwnProperty) { offers = [offers]; }
    const matchBuyYes = offers.filter((o) => ((o.buy && !o.yes) || (!o.buy && o.yes)));
    const matchBuyNo = offers.filter((o) => ((!o.buy && !o.yes) || (o.buy && o.yes)));
    const bestBuyYes = Math.min(matchBuyYes.map((o) => (o.buy ? (100 - o.price) : o.price)));
    const bestBuyNo = Math.min(matchBuyNo.map((o) => (o.buy ? (100 - o.price) : o.price)));
    return [bestBuyYes, bestBuyNo];
};

u.validateOffer = (raw) => {
    console.log(typeof raw.buy);
    if (typeof raw.buy !== "boolean") { throw new Error('buy is not bool'); }
    if (typeof raw.yes !== "boolean") { throw new Error('yes is not bool'); }
    if (typeof raw.contractID !== "string") { throw new Error('cID is not string'); }
    if (!Number.isInteger(raw.quantity)) { throw new Error('quantity is not int'); }
    if (!Number.isInteger(raw.price)) { throw new Error('price is not int'); }
    if (raw.quantity <= 0) { throw new Error('quantity is <= 0'); }
    if (raw.price <= 0 || raw.price >= 100) { throw new Error('price is <= 0 or >= 100'); }
    return raw;
};

module.exports = u;