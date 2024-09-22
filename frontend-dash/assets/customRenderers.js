
const dagcomponentfuncs = (window.dashAgGridComponentFunctions = window.dashAgGridComponentFunctions || {});

dagcomponentfuncs.StockLink = function (props) {
    return React.createElement(
        'a',
        {href: 'https://finance.yahoo.com/quote/' + props.value},
        props.value
    );
};

dagcomponentfuncs.OmniHtml = function (params) {
    return React.createElement(
        'div',
        { dangerouslySetInnerHTML: { __html: params.value } }
    );
};
