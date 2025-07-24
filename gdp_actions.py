import os
import pandas as pd

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, 'gdp_shares_ranks.csv')

# Load the GDP data
df = pd.read_csv(csv_path)

# Transform to long format: country-year rows, variable columns
long_df = pd.DataFrame()

for year in [1995, 2024]:
    temp = pd.DataFrame({
        'Country': df['Country'],
        'Code': df['Code'],
        'Year': year,
        'GDP_Billion': df[f'GDP_{year}_Billion'],
        'GDP_Log': df[f'GDP_{"1995" if year == 1995 else "Latest"}_Log'] if year == 1995 else df['GDP_Latest_Log'],
        'Scale': df[f'Scale_{year}' if year == 1995 else 'Scale_Latest'],
        'Linear_Scale': df[f'Linear_Scale_{year}' if year == 1995 else 'Linear_Scale_Latest'],
        'Share': df[f'Share_{year}'],
        'Share_Rank': df[f'Share_Rank_{year}'],
        'Rank': df[f'Rank_{"1995" if year == 1995 else "Current"}'],
        'Region': df['Region']
    })
    long_df = pd.concat([long_df, temp], ignore_index=True)

# Save the long-format DataFrame to a new CSV file named 'Country_Data.csv'
output_path = os.path.join(script_dir, 'Country_Data.csv')
long_df.to_csv(output_path, index=False)

# TODO: Add more actions as needed 