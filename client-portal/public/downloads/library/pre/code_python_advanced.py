# GSC Services — Python Code (advanced)
# Aus dem Einführungsdokument extrahiert

# ============================================================
# Daten gruppieren und aggregieren (Pandas groupby)
# ============================================================

# Aufgabe
# groupby() + agg() für gruppierte Statistiken.

import pandas as pd
import numpy as np
np.random.seed(42)
df = pd.DataFrame({
    'summe': np.random.uniform(10, 50, 40),
    'geschlecht': np.random.choice(['m','w'], 40),
    'raucher': np.random.choice(['ja','nein'], 40)
})
df.groupby(['geschlecht', 'raucher'])['summe'].agg(['mean', 'std'])

# ============================================================
# Eigene Funktion mit Fehlerbehandlung
# ============================================================

# Aufgabe
# try/except fängt Fehler ab. np.var(ddof=1) = Stichprobenvarianz.

def cohens_d(x, y):
    try:
        n1, n2 = len(x), len(y)
        s = ((n1-1)*np.var(x, ddof=1) + (n2-1)*np.var(y, ddof=1)) / (n1+n2-2)
        return (np.mean(x) - np.mean(y)) / np.sqrt(s)
    except ZeroDivisionError:
        return None
a = np.random.normal(50, 10, 20)
b = np.random.normal(55, 10, 20)
print(cohens_d(a, b))

# ============================================================
# Multiple Regression (statsmodels)
# ============================================================

# Aufgabe
# sm.OLS() = Ordinary Least Squares. sm.add_constant() fügt Achsenabschnitt hinzu.

import statsmodels.api as sm
np.random.seed(42)
n = 50
x1 = np.random.normal(50, 10, n)
x2 = np.random.normal(30, 5, n)
y = 5 + 0.5*x1 + 0.3*x2 + np.random.normal(0, 8, n)
X = sm.add_constant(np.column_stack([x1, x2]))
mod = sm.OLS(y, X).fit()
print(mod.summary())

# ============================================================
# Einfaktorielle ANOVA (SciPy) und Post-hoc
# ============================================================

# Aufgabe
# f_oneway() = ANOVA. Bonferroni: p × Anzahl Vergleiche.

from scipy.stats import f_oneway, ttest_ind
from itertools import combinations
np.random.seed(7)
a = np.random.normal(50, 8, 15)
b = np.random.normal(58, 8, 15)
c = np.random.normal(45, 8, 15)
f, p = f_oneway(a, b, c)
print(f'F = {f:.3f}, p = {p:.4f}')
gruppen = {'A': a, 'B': b, 'C': c}
for (n1, g1), (n2, g2) in combinations(gruppen.items(), 2):
    t, p_val = ttest_ind(g1, g2)
    print(f'{n1} vs {n2}: t = {t:.3f}, p_adj = {p_val*3:.4f} (Bonferroni)')

# ============================================================
# Seaborn: Fortgeschrittene Visualisierung
# ============================================================

# Aufgabe
# sns.pairplot() = Matrix aller Scatterplots + Verteilungen. hue = Farbcodierung.

import seaborn as sns
import matplotlib.pyplot as plt
df = sns.load_dataset('iris')
sns.pairplot(df, hue='species', diag_kind='kde')
plt.show()
