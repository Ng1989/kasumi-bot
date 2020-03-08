import BasePlugin from '../../core/basePlugin'
import { on_command, toService } from '../../decorator'
import Bot, { Permission } from '../../core'
import axios from 'axios'
import MessageManager from "../../utils/messageManager";
import { random } from "@utils";

@toService('setu', {
  '1. setu': '发送 来份涩图 来份色图 色图 涩图触发功能'
})
class Setu extends BasePlugin {
  setuUserSet: Set<number>

  constructor(bot: Bot) {
    super(bot)
    this.setuUserSet = new Set<number>()
  }

  async setu(
    event: any,
    data: ICqMessageResponseGroup | ICqMessageResponsePrivate,
  ){
    if (data.message_type === 'private') return
    const userId = data.user_id
    const message = data.raw_message
    const msgMap: { [key in number]: string } = {
      1: `${MessageManager.at(userId)}\n你冲太快了，露娜觉得你很恶心，休息三分钟再冲吧！！D区`,
      2: `${MessageManager.at(userId)}\n你....你精力也太旺盛了吧，那么能冲？？？休息三分钟吧...`,
      3: `${MessageManager.at(userId)}\n酝酿个三分钟再冲吧，太快了露娜会嫌弃你的！`,
      4: `${MessageManager.at(userId)}\n喂喂喂？我都还没有感觉，你就冲了？能不能等三分钟？？(ー_ー)!!`
    }
    if (['来份涩图', '来份色图', '涩图', '色图'].includes(message)) {
      if (this.setuUserSet.has(userId)) {
        return this.sendMessage({
          group_id: data.group_id,
          message: msgMap[random(1, 4)]
        })
      }
      const res = await axios.get('https://api.lolicon.app/setu/?size1200')
      const _data: any = res.data
      const msg: any = await this.sendMessage({
        group_id: data.group_id,
        // message: '色图'
        message: MessageManager.image(_data.data[0].url)
      })
      const self = this
      if (msg && msg.status === 'ok') {
        this.setuUserSet.add(userId)
        setTimeout(() => {
          this.setuUserSet.delete(userId)
        }, 1000 * 3 * 60)
        const messageId = msg.data.message_id
        setTimeout(() => {
           this.deleteMsg(messageId).then(msg2 => {
             if (msg2.status === 'failed') {
               self.sendMessage({
                 group_id: data.group_id,
                 message: `setu由于过于OOXX，没法发送，建议去pixiv查看，pid：${_data.data[0].pid}`
               })
             }
           })
        }, 1000 * 17)
      }
    }
  }

}

export default Setu
