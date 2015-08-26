var Css = function() {};
Css.prototype.render = function() {
  var parentReactId = this._reactInternalInstance._rootNodeID.replace(/\.[^.]*$/, '');
  var children = this.props.children;
  var raw = children instanceof Array ? children.join('') : children + '';
  var cssText = raw.replace(/:scope/g, '[data-reactid="' + parentReactId + '"]');
  var dangerousSource = { __html: cssText };
  return React.createElement('style', { dangerouslySetInnerHTML: dangerousSource });
};
