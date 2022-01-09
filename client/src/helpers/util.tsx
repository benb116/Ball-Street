const RenderPrice = (price = 0) => (Math.round(price) / 100).toFixed(2);

export default RenderPrice;
