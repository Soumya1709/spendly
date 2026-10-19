export default function ExpenseList({ expenses, onDelete }) {
  if (expenses.length === 0) return <p>No expenses yet.</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th><th>Category</th><th>Amount</th><th></th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id}>
            <td>{e.name}</td>
            <td>{e.category}</td>
            <td>₹{e.amount.toLocaleString("en-IN")}</td>
            <td>
              <button onClick={() => onDelete(e.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}