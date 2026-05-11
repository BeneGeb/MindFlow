const { withAndroidStyles } = require('@expo/config-plugins');

module.exports = (config, { color }) =>
  withAndroidStyles(config, (mod) => {
    const styles = mod.modResults.resources.style ?? [];
    const appTheme = styles.find((s) => s.$?.name === 'AppTheme');
    if (appTheme) {
      appTheme.item = appTheme.item ?? [];
      const idx = appTheme.item.findIndex((i) => i.$?.name === 'colorPrimary');
      const entry = { $: { name: 'colorPrimary' }, _: color };
      if (idx >= 0) appTheme.item[idx] = entry;
      else appTheme.item.push(entry);
    }
    return mod;
  });
