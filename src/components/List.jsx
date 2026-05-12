import PropTypes from "prop-types"

function List(props) {

    const category = props.category;
    const itemList = props.items;

    const vowals = ["a", "b", "c", "d"];
    // const listVowals = vowals.map(vowal => <li>{vowal}</li>);

    // fruits.sort((a, b) => a.name.localeCompare(b.name));
    itemList.sort((a, b) => a.calories - b.calories);
    const listItems = itemList.map(item =><li className="list-item" key={item.id}>{item.name} <b>{item.calories}</b></li>);
    
    const lowCalFruits = itemList.filter(item => item.calories < 50)
    const listlowCalFruits = lowCalFruits.map(lowCalFruit =><li className="list-item" key={lowCalFruit.id}>{lowCalFruit.name} <b>{lowCalFruit.calories}</b></li>);
    return(
       <>
        {vowals}
        <br/>
        {/* <ul>
            {listVowals}
        </ul>
        <ol>
            {listVowals}
        </ol> */}

        <br/>
        <h3 className="list-category">List of {category}</h3>
        <ul className="list-items">
            {listItems}
        </ul>
        <ol className="list-items">
            {listlowCalFruits}
        </ol>

       </>
    );
}

List.defaultProps = {
    category: "Category",
    itemList: [],
}

export default List ;