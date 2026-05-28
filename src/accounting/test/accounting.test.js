const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createAccountState,
  formatCurrency,
  executeMenuChoice,
  initialBalanceCents,
} = require('../index.js');

test('default starting balance is 1000.00', () => {
  const state = createAccountState();

  assert.equal(state.balanceCents, initialBalanceCents);
  assert.equal(formatCurrency(state.balanceCents), '$1000.00');
});

test('view balance displays the current balance', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '1');

  assert.equal(result.state.balanceCents, initialBalanceCents);
  assert.equal(result.message, 'Current balance: $1000.00');
});

test('credit increases the account balance', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '2', '250.50');

  assert.equal(result.state.balanceCents, 125050);
  assert.equal(result.message, 'Amount credited. New balance: $1250.50');
});

test('debit subtracts when funds are available', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '3', '200.25');

  assert.equal(result.state.balanceCents, 79975);
  assert.equal(result.message, 'Amount debited. New balance: $799.75');
});

test('debit rejects amounts greater than the available balance', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '3', '1500.00');

  assert.equal(result.state.balanceCents, initialBalanceCents);
  assert.equal(result.message, 'Insufficient funds for this debit.');
});

test('debit equal to the available balance exhausts the account', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '3', '1000.00');

  assert.equal(result.state.balanceCents, 0);
  assert.equal(result.message, 'Amount debited. New balance: $0.00');
});

test('invalid menu input keeps the balance and shows an error', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '9');

  assert.equal(result.state.balanceCents, initialBalanceCents);
  assert.equal(result.message, 'Invalid choice, please select 1-4.');
});

test('invalid amount input is rejected', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '2', 'abc');

  assert.equal(result.state.balanceCents, initialBalanceCents);
  assert.equal(result.message, 'Invalid amount. Please enter a numeric value.');
});

test('exit returns the goodbye message without changing the balance', () => {
  const state = createAccountState();

  const result = executeMenuChoice(state, '4');

  assert.equal(result.state.balanceCents, initialBalanceCents);
  assert.equal(result.message, 'Exiting the program. Goodbye!');
});

test('balance persists across multiple operations in the same session', () => {
  let state = createAccountState();

  let result = executeMenuChoice(state, '2', '100.00');
  state = result.state;

  result = executeMenuChoice(state, '1');
  assert.equal(result.message, 'Current balance: $1100.00');

  state = result.state;
  result = executeMenuChoice(state, '3', '50.00');
  state = result.state;

  result = executeMenuChoice(state, '1');
  assert.equal(result.message, 'Current balance: $1050.00');
  assert.equal(result.state.balanceCents, 105000);
});
