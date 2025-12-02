import "./styles.css";

function SearchBar({ search, onSearchChange, onSubmit }) {
  return (
    <div className="row text-center search-container">
      <div className="text-center">
        <h1>Every Leaf Tells a Story</h1>
        <h5>Use the search to meet new plants and bring life into your space.</h5>

        <form className="searchBar" onSubmit={onSubmit}>
          <input
            className="col-10"
            type="text"
            placeholder="Search by name (e.g.: tulip, begonia, daisy...)"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />

          <button className="col-2 botaoSearch" type="submit">
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

export default SearchBar;
