/**
 * 广告播放插件
 */
const readBoolean = value =>
  value === true || (typeof value === 'string' && /^(true|1|yes|on)$/i.test(value.trim()))

module.exports = {
  // 谷歌广告
  ADSENSE_GOOGLE_ID: process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_ID || '', // 谷歌广告ID e.g ca-pub-xxxxxxxxxxxxxxxx
  ADSENSE_GOOGLE_TEST: readBoolean(process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_TEST), // 谷歌广告ID测试模式
  ADSENSE_GOOGLE_SLOT_IN_ARTICLE:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_IN_ARTICLE || '', // Google AdSense 文章内嵌广告单元
  ADSENSE_GOOGLE_SLOT_FLOW:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_FLOW || '', // Google AdSense 信息流广告单元
  ADSENSE_GOOGLE_SLOT_NATIVE:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_NATIVE || '', // Google AdSense 原生广告单元
  ADSENSE_GOOGLE_SLOT_AUTO:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_AUTO || '', // Google AdSense 自动广告单元

  // 万维广告
  AD_WWADS_ID: process.env.NEXT_PUBLIC_WWAD_ID || null, // https://wwads.cn/ 创建您的万维广告单元ID
  AD_WWADS_BLOCK_DETECT: readBoolean(process.env.NEXT_PUBLIC_WWADS_AD_BLOCK_DETECT) // 是否开启WWADS广告屏蔽插件检测
}
