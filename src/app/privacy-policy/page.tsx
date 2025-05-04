import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-20 px-6">
        <div className="max-w-4xl mx-auto bg-black/50 backdrop-blur-md p-8 rounded-xl border border-white/10 text-white">
          <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-white/10">プライバシーポリシー</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-4">1. はじめに</h2>
              <p className="text-gray-300">
                Mimiru（以下、「当社」といいます）は、本ウェブサイト上で提供するサービス（以下、「本サービス」といいます）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます）を定めます。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">2. 個人情報の定義</h2>
              <p className="text-gray-300">
                本ポリシーにおいて「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">3. 個人情報の収集方法</h2>
              <p className="text-gray-300">
                当社は、ユーザーが利用登録をする際に氏名、生年月日、住所、電話番号、メールアドレス、銀行口座番号、クレジットカード番号、運転免許証番号などの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされた取引の内容に関する情報を、提携先などから収集することがあります。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">4. 個人情報を収集・利用する目的</h2>
              <p className="text-gray-300">
                当社が個人情報を収集・利用する目的は、以下のとおりです。
              </p>
              <ol className="list-decimal list-inside text-gray-300 mt-2 space-y-1">
                <li>当社サービスの提供・運営のため</li>
                <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
                <li>ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため</li>
                <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
                <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                <li>ユーザーにご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
                <li>有料サービスにおいて、ユーザーに利用料金を請求するため</li>
                <li>上記の利用目的に付随する目的</li>
              </ol>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">5. 個人情報の第三者提供</h2>
              <p className="text-gray-300">
                当社は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
              </p>
              <ol className="list-decimal list-inside text-gray-300 mt-2 space-y-1">
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
                <li>予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき</li>
              </ol>
              <ul className="list-disc list-inside text-gray-300 ml-6 mt-2 space-y-1">
                <li>利用目的に第三者への提供を含むこと</li>
                <li>第三者に提供されるデータの項目</li>
                <li>第三者への提供の手段または方法</li>
                <li>本人の求めに応じて個人情報の第三者への提供を停止すること</li>
                <li>本人の求めを受け付ける方法</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">6. 個人情報の開示</h2>
              <p className="text-gray-300">
                当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
              </p>
              <ol className="list-decimal list-inside text-gray-300 mt-2 space-y-1">
                <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                <li>その他法令に違反することとなる場合</li>
              </ol>
              <p className="text-gray-300 mt-2">
                前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">7. 個人情報の訂正および削除</h2>
              <p className="text-gray-300">
                ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下、「訂正等」といいます）を請求することができます。
              </p>
              <p className="text-gray-300 mt-2">
                当社は、ユーザーから前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。
              </p>
              <p className="text-gray-300 mt-2">
                当社は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知します。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">8. 個人情報の利用停止等</h2>
              <p className="text-gray-300">
                当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下、「利用停止等」といいます）を求められた場合には、遅滞なく必要な調査を行います。
              </p>
              <p className="text-gray-300 mt-2">
                前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。
              </p>
              <p className="text-gray-300 mt-2">
                当社は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをユーザーに通知します。
              </p>
              <p className="text-gray-300 mt-2">
                前2項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、ユーザーの権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">9. Cookieの利用について</h2>
              <p className="text-gray-300">
                当社は、ユーザーの利便性向上のため、Cookieを使用することがあります。Cookieとは、ウェブサイトがユーザーのコンピュータに保存する小さなテキストファイルで、再度ウェブサイトを訪れた際に、ウェブサイトがCookieを読み取ることで、ユーザーのブラウザを識別できます。
              </p>
              <p className="text-gray-300 mt-2">
                当社は、以下の目的でCookieを使用します：
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>ユーザーのログイン状態を保持するため</li>
                <li>ユーザーの好みや設定を記憶するため</li>
                <li>サイトの利用状況を分析し、サービスを改善するため</li>
              </ul>
              <p className="text-gray-300 mt-2">
                ユーザーは、ブラウザの設定を変更することでCookieの受け入れを拒否することができます。ただし、その場合、一部のサービス機能が利用できなくなる可能性があります。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">10. プライバシーポリシーの変更</h2>
              <p className="text-gray-300">
                本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。
              </p>
              <p className="text-gray-300 mt-2">
                当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">11. お問い合わせ窓口</h2>
              <p className="text-gray-300">
                本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。
              </p>
              <p className="text-gray-300 mt-2">
                Eメールアドレス：info@mimiru.app
              </p>
            </section>
            
            <p className="text-gray-400 mt-8">
              以上
            </p>
            <p className="text-gray-400">
              制定日: 2024年5月1日
            </p>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/" className="inline-block px-6 py-3 rounded-full border border-white text-white hover:bg-white/10 transition-colors">
              トップページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 