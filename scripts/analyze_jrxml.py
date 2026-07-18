"""Extract billing formulas from jrxml report templates."""
import re, os

jrxml_files = [
    r'D:\billing old source file\GITHUB_REPOSITORY_DRAFT\reports\jrxml\invoice_water.jrxml',
    r'D:\billing old source file\GITHUB_REPOSITORY_DRAFT\reports\jrxml\invoice_elec.jrxml',
    r'D:\billing old source file\GITHUB_REPOSITORY_DRAFT\reports\jrxml\invoice_water_new.jrxml',
    r'D:\billing old source file\GITHUB_REPOSITORY_DRAFT\reports\jrxml\invoice_water_new_Palm.jrxml',
    r'D:\billing old source file\GITHUB_REPOSITORY_DRAFT\reports\jrxml\monthly_finance.jrxml',
    r'D:\billing old source file\GITHUB_REPOSITORY_DRAFT\reports\jrxml\sub_report_tariff_charge.jrxml',
    r'D:\billing old source file\GITHUB_REPOSITORY_DRAFT\reports\jrxml\sub_report_tariff_charge_detail.jrxml',
]

for jf in jrxml_files:
    name = os.path.basename(jf)
    if not os.path.exists(jf):
        print(f"SKIP: {name} -- not found")
        continue
    
    with open(jf, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract SQL queries
    sqls = re.findall(r'<!\[CDATA\[(.*?)\]\]>', content, re.DOTALL)
    clean_sqls = []
    for q in sqls:
        q = q.strip()
        if 'SELECT' in q.upper() or 'select' in q.lower():
            clean_sqls.append(q[:400])
    
    # Extract fields
    fields = re.findall(r'<field name="([^"]+)"', content)
    
    # Extract parameters
    params = re.findall(r'<parameter name="([^"]+)"', content)
    
    # Extract variables with expressions
    vars_found = re.findall(r'<variable name="([^"]+)"(.*?)<variableExpression>(.*?)</variableExpression>', content, re.DOTALL)
    variables = [(v[0], v[2].strip()[:150]) for v in vars_found[:10]]
    
    print(f"\n=== {name} ({len(content)} bytes) ===")
    print(f"  Parameters: {params[:8]}")
    print(f"  Fields ({len(fields)}): {fields[:12]}")
    print(f"  Variables ({len(vars_found)}):")
    for vname, vexpr in variables:
        print(f"    {vname} = {vexpr}")
    print(f"  SQL queries ({len(clean_sqls)}):")
    for q in clean_sqls[:2]:
        print(f"    {q[:250]}")
