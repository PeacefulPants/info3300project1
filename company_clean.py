import pandas as pd

df = pd.read_csv('vgsales_clean.csv')


def platform_to_company(Platform):

    nintendo_platforms = ['Wii', 'GB','3DS', 'DS', 'GameCube', 'SNES', 'NES', 'GBA','3DS', 'N64', 'WiiU', 'GC'] 
    microsoft_platforms = ['XOne', 'X360', 'XB'] 
    sony_platforms = [ 'PS4', 'PS3', 'PS2', 'PS', 'PSP', 'PSV', 'PSX'] 

    if Platform in nintendo_platforms:
        return 'Nintendo'
    elif Platform in microsoft_platforms:
        return 'Microsoft'
    elif Platform in sony_platforms:
        return 'Sony'
    else:
        return 'Other'  


df['Company'] = df['Platform'].apply(platform_to_company)


df.to_csv('cleanclean.csv', index=False)
