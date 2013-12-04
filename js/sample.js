
// http://stackoverflow.com/questions/498970/how-do-i-trim-a-string-in-javascript
if (!String.prototype.trim)
{
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

function showtree_sample(element_id) {
    var element = document.getElementById(element_id);
    var newick = element.value;
    
    if (newick == '(A,B);'){
        showtree('(A,B);','svg1', 'viewport1', 'message1')
    }
    if (newick == '((A,B),C);') {
        showtree('(A,B);', 'svg1', 'viewport1', 'message1');
        showtree('((A,B),C);', 'svg2', 'viewport2','message2' );
        //showtree('((A,B),(C,D));', 'svg3', 'viewport3');
    }

    else if (newick == '((A,B),(C,D));') {
        showtree('(A,B);', 'svg1', 'viewport1','message1');
        showtree('(C,D);', 'svg2', 'viewport2','message2');
        showtree('((A,B),(C,D));', 'svg3', 'viewport3','message3');
        //showtree(';','svg4', 'viewport4','');
    }
    else if (newick == '((A,B),(C,E));') {
        showtree('(A,B);', 'svg1', 'viewport1','message1');
        showtree('(C,E);', 'svg2', 'viewport2','message2');
        showtree('((A,B),(C,E));', 'svg3', 'viewport3','message3');
        //showtree(';','svg4', 'viewport4','');
    }
    else if (newick == '(((A,B),C),(D,E));') {
        showtree('(A,B);', 'svg1', 'viewport1','message1');
        showtree('(D,E);', 'svg2', 'viewport2','message2');
        showtree('((A,B),C);', 'svg3', 'viewport3','message3');
        showtree('(((A,B),C),(D,E));', 'svg4', 'viewport4','message4');
    }
    else if (newick == '(((A,B),E),(C,D));') {
        showtree('(A,B);', 'svg1', 'viewport1','message1');
        showtree('(C,D);', 'svg2', 'viewport2','message2');
        showtree('((A,B),E);', 'svg3', 'viewport3','message3');
        showtree('(((A,B),E),(C,D));', 'svg4', 'viewport4','message4');
    }
    else if (newick == '(((P,Q),R),(S,T));') {
        showtree('(P,Q);', 'svg1', 'viewport1');
        showtree('(S,T);', 'svg2', 'viewport2');
        showtree('((P,Q),R);', 'svg3', 'viewport3');
        showtree('(((P,Q),R),(S,T));', 'svg4', 'viewport4');
    }
}

function showtree(newick, svgNID, viewportID, messageID)
{
    var t = new Tree();
    newick = newick.trim(newick);
    t.Parse(newick);

    if (t.error != 0)
    {
        document.getElementById('message1').innerHTML = 'Error parsing tree';
    }
    else
    {
        //document.getElementById('message1').innerHTML = 'Parsed OK';
        
        var text = newick.substring(0,newick.length - 1);
        text = 'Build the tree for ' + text
        if (messageID == 'message1'){
            document.getElementById('message1').innerHTML = 'Step 1 : ' + text;
        }
        if (messageID == 'message2'){
            document.getElementById('message2').innerHTML = 'Step 2 : ' + text;
        }
        if (messageID == 'message3'){
            document.getElementById('message3').innerHTML = 'Step 3 : ' + text;
        }
        if (messageID == 'message4'){
            document.getElementById('message4').innerHTML = 'Step 4 : ' + text;
        }

        t.WriteNewick();

        t.ComputeWeights(t.root);

        var td = null;

        var selectmenu = document.getElementById('style');
        var drawing_type = (selectmenu.options[selectmenu.selectedIndex].value);

        switch (drawing_type)
        {
            case 'rectanglecladogram':
                td = new RectangleTreeDrawer();
                break;

            case 'phylogram':
                if (t.has_edge_lengths)
                {
                    td = new PhylogramTreeDrawer();
                }
                else
                {
                    td = new RectangleTreeDrawer();
                }
                break;

            case 'circle':
                td = new CircleTreeDrawer();
                break;

            case 'circlephylogram':
                if (t.has_edge_lengths)
                {
                    td = new CirclePhylogramDrawer();
                }
                else
                {
                    td = new CircleTreeDrawer();
                }
                break;

            case 'cladogram':
            default:
                td = new TreeDrawer();
                break;
        }

        // clear existing diagram, if any
        var svg = document.getElementById(svgNID);
        while (svg.hasChildNodes())
        {
            svg.removeChild(svg.lastChild);
        }


        var cssStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        cssStyle.setAttribute('type', 'text/css');

        var style = document.createTextNode("text{font-size:20px;}");
        cssStyle.appendChild(style);

        svg.appendChild(cssStyle);


        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('id', viewportID);
        svg.appendChild(g);


        td.Init(t, {svg_id: viewportID, width: 300, height: 300, fontHeight: 10, root_length: 0.1});

        td.CalcCoordinates();
        td.Draw();

        // label leaves...

        var n = new NodeIterator(t.root);
        var q = n.Begin();
        while (q != null)
        {
            if (q.IsLeaf())
            {
                switch (drawing_type)
                {
                    case 'circle':
                    case 'circlephylogram':
                        var align = 'left';
                        var angle = q.angle * 180.0 / Math.PI;
                        if ((q.angle > Math.PI / 2.0) && (q.angle < 1.5 * Math.PI))
                        {
                            align = 'right';
                            angle += 180.0;
                        }
                        drawRotatedText(viewportID, q.xy, q.label, angle, align)
                        break;

                    case 'cladogram':
                    case 'rectanglecladogram':
                    case 'phylogram':
                    default:
                        drawText(viewportID, q.xy, q.label);
                        break;
                }
            }
            q = n.Next();
        }
        // pan
        $(svgNID).svgPan(viewportID);
    }
}