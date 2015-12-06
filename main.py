from flask import Flask, render_template, send_file, url_for
import jinja2
app = Flask(__name__)

default_code = {}
default_code['1'] = jinja2.Markup('<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start" x="50" y="50"><next><block type="hop"><field name="direction">forward</field></block></next></block></xml>')
default_code['2'] = jinja2.Markup('<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start" x="50" y="50"><next><block type="hop"><field name="direction">forward</field></block></next></block></xml>')
default_code['3'] = jinja2.Markup('<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start" x="50" y="50"><next><block type="hop"><field name="direction">forward</field></block></next></block></xml>')
default_code['4'] = jinja2.Markup('<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start" x="50" y="50"><next><block type="hop"><field name="direction">forward</field></block></next></block></xml>')
default_code['5'] = jinja2.Markup('<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start" x="50" y="50"><next><block type="repeat_loop"><field name="times">5</field></block></next></block></xml>')
default_code['6'] = jinja2.Markup('<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start" x="50" y="50"></block></xml>')
default_code['7'] = jinja2.Markup('<xml xmlns="http://www.w3.org/1999/xhtml"><block type="start" x="50" y="50"><next><block type="repeat_loop"><field name="times">5</field></block></next></block></xml>')

tasks = {};
tasks['1'] = 'Add another hop forward command to help Crossy collect the coin.'
tasks['2'] = 'Program Crossy to collect both coins.'
tasks['3'] = 'Program Crossy to collect both coins.'
tasks['4'] = 'How quickly can you code?'
tasks['5'] = 'Use the repeat block and the hop forward command to help Crossy collect the coin.'
tasks['6'] = 'Help Crossy zigzag his way towards the coin.'
tasks['7'] = 'Use the repeat block to re-solve the last level.'

@app.route('/crossy/<level>')
def crossy(level):
    if level == '8':
        return render_template('congratulations.html')
    else:
        return render_template('index.html', level=level, defaultCode=default_code[level], task=tasks[level])

@app.route('/crossyAsset/<assetname>')
def crossyAsset(assetname):
    # Security
    if '..' in assetname or assetname.startswith('/'):
        abort(404)
    return send_file('static/assets/%s' % assetname)

@app.route('/map/<level>')
def getMap(level):
    return send_file('static/maps/%s.json' % level)

if __name__ == '__main__':
    app.run(debug=True)