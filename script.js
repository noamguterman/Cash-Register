let price = 4.99;
let cid = [
  ["PENNY", 1.00],
  ["NICKEL", 2.05],
  ["DIME", 3.1],
  ["QUARTER", 4.25],
  ["ONE", 90],
  ["FIVE", 55],
  ["TEN", 20],
  ["TWENTY", 60],
  ["ONE HUNDRED", 100]
];

const currencyValues = {
  "PENNY": 1,
  "NICKEL": 5,
  "DIME": 10,
  "QUARTER": 25,
  "ONE": 100,
  "FIVE": 500,
  "TEN": 1000,
  "TWENTY": 2000,
  "ONE HUNDRED": 10000
};

const spanMap = {
  "PENNY": document.getElementById('cid-penny'),
  "NICKEL": document.getElementById('cid-nickel'),
  "DIME": document.getElementById('cid-dime'),
  "QUARTER": document.getElementById('cid-quarter'),
  "ONE": document.getElementById('cid-one'),
  "FIVE": document.getElementById('cid-five'),
  "TEN": document.getElementById('cid-ten'),
  "TWENTY": document.getElementById('cid-twenty'),
  "ONE HUNDRED": document.getElementById('cid-hundred')
};

const priceSpan = document.getElementById("price");
const purchaseBtn = document.getElementById("purchase-btn");
const changeDueList = document.getElementById("change-due-list");

const updateTotalText = () => {
  priceSpan.textContent = price;
};

const updateDrawerText = () => {
  cid.forEach(([unit, amount]) => {
    spanMap[unit].textContent = amount.toFixed(2);
  });
};

purchaseBtn.addEventListener("click", () => {
  const cash = Number(document.getElementById("cash").value) * 100;
  const priceInCents = price * 100;
  if (!cash) {
    alert("Please enter a number");
  } else if (cash < priceInCents) {
    alert("Customer does not have enough money to purchase the item");
  } else if (cash === priceInCents) {
    changeDueList.innerHTML = `<li>No change due - customer paid with exact cash</li>`;
  } else {
    changeDue(cash, priceInCents);
  }
});

const calculateCidTotalAmount = (cid) => {
  return cid.reduce((total, [, amount]) => total + (amount * 100), 0);
};

const changeDue = (cash, priceInCents) => {
  const changeAmount = cash - priceInCents;
  const cidTotal = calculateCidTotalAmount(cid);

  if (cidTotal < changeAmount) {
    changeDueList.innerHTML = `<li>Status: INSUFFICIENT_FUNDS</li>`;
  } else {
    const result = calculateChange(cash, priceInCents, cid);
    if (result.status === "INSUFFICIENT_FUNDS") {
      changeDueList.innerHTML = `<li>Status: INSUFFICIENT_FUNDS</li>`;
    } else if (result.status === "CLOSED") {
      changeDueList.innerHTML = `<li>Status: CLOSED</li>`;
      result.change.forEach(([unit, amount]) => {
        changeDueList.innerHTML += `<li>${unit}: $${(amount / 100).toFixed(2)}</li>`;
      });
      updateDrawerText();
    } else {
      changeDueList.innerHTML = `<li>Status: OPEN</li>`;
      result.change.forEach(([unit, amount]) => {
        changeDueList.innerHTML += `<li>${unit}: $${(amount / 100).toFixed(2)}</li>`;
      });
      updateDrawerText();
    }
  }
};

const calculateChange = (cash, priceInCents, cid) => {
  let changeAmount = cash - priceInCents;
  const changeArr = [];
  let totalChangeGiven = 0;

  cid = cid.slice().reverse();

  for (let i = 0; i < cid.length; i++) {
    const [unit, amount] = cid[i];
    const unitValue = currencyValues[unit];
    let unitChange = 0;
    let billAvailable = amount * 100;

    while (changeAmount >= unitValue && billAvailable >= unitValue) {
      billAvailable -= unitValue;
      changeAmount -= unitValue;
      unitChange += unitValue;
      changeAmount = Math.round(changeAmount);
    }

    if (unitChange > 0) {
      changeArr.push([unit, unitChange]);
      cid[i][1] -= unitChange / 100;
      totalChangeGiven += unitChange;
    }
  }

  const cidRemainingTotal = calculateCidTotalAmount(cid);

  if (changeAmount > 0) {
    return { status: "INSUFFICIENT_FUNDS", change: [] };
  } else if (cidRemainingTotal === 0 && totalChangeGiven === cash - priceInCents) {
    return { status: "CLOSED", change: changeArr };
  } else {
    return { status: "OPEN", change: changeArr };
  }
};

updateTotalText();
updateDrawerText();