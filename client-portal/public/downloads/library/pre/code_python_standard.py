# GSC Services — Python Code (standard)
# Aus dem Einführungsdokument extrahiert

# ============================================================
# Listen, Arrays, Berechnungen (NumPy)
# ============================================================

# Aufgabe
# np.array() erzeugt Array. ddof=1 für Stichproben-STD.

import numpy as np
z = np.array([5, 10, 15, 20, 25])
print(z * 2)
print(np.sum(z), np.mean(z), np.std(z, ddof=1))

# ============================================================
# DataFrame und describe() (Pandas)
# ============================================================

# Aufgabe
# pd.DataFrame() erstellt Tabelle. describe() = summary.

import pandas as pd
import numpy as np
np.random.seed(1)
df = pd.DataFrame({
    'alter': np.random.randint(20, 40, 10),
    'note': np.round(np.random.uniform(1, 5, 10), 1)
})
print(df.head())
print(df.describe())

# ============================================================
# CSV einlesen und filtern (Pandas)
# ============================================================

# Aufgabe
# Boolesches Indexing: df[Bedingung].

import pandas as pd
df = pd.read_csv('personen.csv', sep=';')
frauen = df[df['geschlecht'] == 'w']
print(frauen['groesse'].mean())

# ============================================================
# t-Test und Boxplot (SciPy + Matplotlib)
# ============================================================

# Aufgabe
# stats.ttest_ind() = t-Test unabhängig.

from scipy import stats
import matplotlib.pyplot as plt
np.random.seed(42)
a = np.random.normal(50, 10, 15)
b = np.random.normal(65, 10, 15)
t, p = stats.ttest_ind(a, b)
print(f't = {t:.3f}, p = {p:.4f}')
plt.boxplot([a, b], labels=['A','B'])
plt.show()

# ============================================================
# Lineare Regression (SciPy) und Plot
# ============================================================

# Aufgabe
# linregress() gibt Steigung, Achse, r, p-Wert.

from scipy import stats
np.random.seed(7)
x = np.arange(1, 21)
y = 3 + 2*x + np.random.normal(0, 3, 20)
res = stats.linregress(x, y)
print(f'y = {res.intercept:.2f} + {res.slope:.2f}x, R² = {res.rvalue**2:.3f}')
plt.scatter(x, y)
plt.plot(x, res.intercept + res.slope*x, 'r-')
plt.show()
