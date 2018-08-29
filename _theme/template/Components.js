import React from 'react';
import Layout from './Layout';
import SideMenu from './Menu/SideMenu';
import DemoArticle from './Content/DemoArticle';
import PureArticle from './Content/PureArticle';
import DemoSubArticle from './Content/DemoSubArticle';

export default class Doc extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.location.pathname !== nextProps.location.pathname;
  }

  getLevel1Eement(props) {
    let type;
    if (props.pageData.demo) {
      type = 'demo';
    }
    console.log('type1:::', type, props)
    return (type === 'demo'
            ? <DemoArticle routeParams={props.routeParams} pageData={props.pageData} utils={props.utils}/>
            : <PureArticle pageData={props.pageData} utils={props.utils}/>
    )
  }

  getLevel2Eement(props) {
    return <DemoSubArticle routeParams={props.routeParams} pageData={props.pageData} childName={props.params}
                           utils={props.utils}/>
  }

  render() {
    const props = this.props;
    return <Layout route={props.route}>
      <div id="doc">
        <aside id="aside" style={{overflowY: 'auto'}}>
          <SideMenu
              type="components"
              defaultSelectedKey={props.routeParams.doc}
              data={props.data}
          />
        </aside>
        <article id="article">
          {
            props.children ? this.getLevel2Eement(props) : this.getLevel1Eement(props)
          }
        </article>
      </div>
    </Layout>
  }
}


