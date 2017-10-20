module.exports = {
    /**
     * Generates an expression that can later be used to check if a source matches the expression
     * @param {*} stringExp 
     * @param {*} custom 
     */
    parseExp : function(stringExp, custom){
        if(custom != null){
            this.custom = custom;
        }
        let binExp = parseGroup(stringExp);
        if(binExp != null){
            return binExp;
        }
        binExp = parseOr(stringExp);
        if(binExp != null){
            return binExp;
        }
        binExp = parseAnd(stringExp);
        if(binExp != null){
            return binExp;
        }
        binExp = parseInvert(stringExp);
        if(binExp != null){
            return binExp;
        }
        if(!containForbidden(stringExp)){
            if(this.custom != null){
                return new costumUnOp(customContainMatch, stringExp, this.custom);
            } else{
                return new unOp(contain, stringExp);
            }
        }
        return null;
    }
}

function containForbidden(Exp){
    return Exp.indexOf('|') != -1 || Exp.indexOf('&') != -1 || Exp.indexOf('!') != -1 || Exp.indexOf(')') != -1 || Exp.indexOf('(') != -1;
}

function parseGroup(Exp){
    if(Exp.charAt(0) == "(" && Exp.charAt(Exp.length - 1) == ')' && matchEndIndex(Exp) == Exp.length - 1){
        return module.exports.parseExp(Exp.substr(1, Exp.length -2));
    }
    return null;
}
function parseInvert(Exp){
    if(Exp.charAt(0) == '!'){
        let index = Exp.indexOf('!');
        let subExp = module.exports.parseExp(Exp.substr(index+1));
        if(subExp != null){
            return new unOp(invert, subExp);
        }
    }
    return null;
}
function parseAnd(Exp){
    if(Exp.indexOf('&') != -1){
        let index = Exp.indexOf('&');
        let firstExp = module.exports.parseExp(Exp.substr(0,index));
        let secondExp = module.exports.parseExp(Exp.substr(index+1));
        if(firstExp != null && secondExp != null){
            return new binOp(and,firstExp,secondExp);
        }
    }
    return null;
}
function parseOr(Exp){
    if(Exp.indexOf('|') != -1){
        let index = Exp.indexOf('|');
        let firstExp = module.exports.parseExp(Exp.substr(0,index));
        let secondExp = module.exports.parseExp(Exp.substr(index+1));
        if(firstExp != null && secondExp != null){
            return new binOp(or,firstExp,secondExp);
        }
    }
    return null;
}

function matchEndIndex(string){
    let counter = 0;
    let index = 0;
    while(index < string.length ){
        currentChar = string.charAt(index);
        if(currentChar == '('){
            counter++;
        } else if (currentChar == ')'){
            counter--;
        }
        if(counter == 0){
            return index;
        }
        index++;
    }
    return -1;

}


/**
 * Constructors for binOp,unOp and customUnOp
 * @param {*} match Function to call when a source is matched
 */
function binOp(match, firstExp, secondExp){
    this.match = match;
    this.firstExp = firstExp;
    this.secondExp = secondExp;
}

function unOp(match, Exp){
    this.match = match;
    this.Exp = Exp;
}
/**
 * @param {*} custom Custom function to use when evaluating
 */
function customUnOp(match, Exp, custom){
    this.match = match;
    this.Exp = Exp;
    this.custom = custom;
}

/**
 * Functions to match with the source depending on the operation type
 * @param {*} source 
 */

function and(source){
    return this.firstExp.match(source) && this.secondExp.match(source);
}

function or(source){
    return this.firstExp.match(source) || this.secondExp.match(source);
}

function invert(source){
    return !this.Exp.match(source, this.Exp);
}

/**
 * These contain function are the only leaf operators (won't call on sub operators) and can either be custom defined or left to the default
 * @param {*} source 
 */
function customContainMatch(source){
    return this.custom(source,this.Exp);
}

/**
 * The default contain function assumes that source is a array and checks if the expression is in the array
 * @param {*} source 
 */
function contain(source){
    return source.indexOf(this.Exp) != -1;
}
