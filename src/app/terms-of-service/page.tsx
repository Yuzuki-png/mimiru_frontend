import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-20 px-6">
        <div className="max-w-4xl mx-auto bg-black/50 backdrop-blur-md p-8 rounded-xl border border-white/10 text-white">
          <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-white/10">利用規約</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-bold mb-4">1. はじめに</h2>
              <p className="text-gray-300">
                この利用規約（以下、「本規約」といいます）は、Mimiru（以下、「当社」といいます）がこのウェブサイト上で提供するサービス（以下、「本サービス」といいます）の利用条件を定めるものです。登録ユーザーの皆様（以下、「ユーザー」といいます）には、本規約に従って本サービスをご利用いただきます。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">2. 利用登録</h2>
              <p className="text-gray-300">
                本サービスの利用を希望する者は、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
              </p>
              <p className="text-gray-300 mt-2">
                当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあり、その理由については一切の開示義務を負わないものとします。
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当社が利用登録を適当でないと判断した場合</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">3. ユーザーIDおよびパスワードの管理</h2>
              <p className="text-gray-300">
                ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを管理するものとします。
              </p>
              <p className="text-gray-300 mt-2">
                ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与することはできません。当社は、ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には、そのユーザーIDを登録しているユーザー自身による利用とみなします。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">4. 禁止事項</h2>
              <p className="text-gray-300">
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>当社のサービスの運営を妨害するおそれのある行為</li>
                <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                <li>他のユーザーに成りすます行為</li>
                <li>当社のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">5. 本サービスの提供の停止等</h2>
              <p className="text-gray-300">
                当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当社が本サービスの提供が困難と判断した場合</li>
              </ul>
              <p className="text-gray-300 mt-2">
                当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害について、理由を問わず一切の責任を負わないものとします。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">6. 利用制限および登録抹消</h2>
              <p className="text-gray-300">
                当社は、以下の場合には、事前の通知なく、ユーザーに対して、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
              </p>
              <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録事項に虚偽の事実があることが判明した場合</li>
                <li>その他、当社が本サービスの利用を適当でないと判断した場合</li>
              </ul>
              <p className="text-gray-300 mt-2">
                当社は、本条に基づき当社が行った行為によりユーザーに生じた損害について、一切の責任を負いません。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">7. 免責事項</h2>
              <p className="text-gray-300">
                当社の債務不履行責任は、当社の故意または重過失によらない場合には免責されるものとします。
              </p>
              <p className="text-gray-300 mt-2">
                当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">8. サービス内容の変更等</h2>
              <p className="text-gray-300">
                当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">9. 利用規約の変更</h2>
              <p className="text-gray-300">
                当社は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">10. 通知または連絡</h2>
              <p className="text-gray-300">
                ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">11. 権利義務の譲渡の禁止</h2>
              <p className="text-gray-300">
                ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約に基づく権利もしくは義務を第三者に譲渡し、または担保に供することはできません。
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold mb-4">12. 準拠法・裁判管轄</h2>
              <p className="text-gray-300">
                本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
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