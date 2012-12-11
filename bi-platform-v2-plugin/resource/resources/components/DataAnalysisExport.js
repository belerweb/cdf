var DataAnalysisExportTemplate = '<h4>{{=it.title}}</h4>'
    + '<hr>'
    + '<div class="container-fluid">'
    + '  <div class="row-fluid DataAnalysisExport_Schemas">'
    + '    <div class="span6">'
    + '      <div class="form-horizontal col1">'
    + '        {{~it.defaultSchemas :schema:index}} {{? index%2==0 }}'
    + '        <div class="control-group">'
    + '          <label class="control-label">{{=schema[0]}}：</label>'
    + '          <div class="controls">'
    + '            <select class="input-mini">'
    + '              <option value="1">&lt;</option>'
    + '              <option value="2">=</option>'
    + '              <option value="3">&gt;</option>'
    + '              <option value="4">&lt;=</option>'
    + '              <option value="5">&gt;=</option>'
    + '            </select> <input type="text" class="input-small" name="{{=schema[1]}}">'
    + '          </div>'
    + '        </div>'
    + '        {{?}} {{~}}'
    + '      </div>'
    + '    </div>'
    + '    <div class="span6">'
    + '      <div class="form-horizontal col2">'
    + '        {{~it.defaultSchemas :schema:index}} {{? index%2==1 }}'
    + '        <div class="control-group">'
    + '          <label class="control-label">{{=schema[0]}}：</label>'
    + '          <div class="controls">'
    + '            <select class="input-mini">'
    + '              <option value="1">&lt;</option>'
    + '              <option value="2">=</option>'
    + '              <option value="3">&gt;</option>'
    + '              <option value="4">&lt;=</option>'
    + '              <option value="5">&gt;=</option>'
    + '            </select> <input type="text" class="input-small" name="{{=schema[1]}}">'
    + '          </div>'
    + '        </div>'
    + '        {{?}} {{~}}'
    + '      </div>'
    + '    </div>'
    + '  </div>'
    + '</div>'
    + '<hr>'
    + '<div class="form-inline pagination-centered DataAnalysisExport_Option">'
    + '  <select name="label"> {{~it.schemas :schema:index}}'
    + '    <option value="{{=schema[1]}}">{{=schema[0]}}</option> {{~}}'
    + '  </select><label>：</label><select class="input-mini" name="cond">'
    + '    <option value="1">&lt;</option>'
    + '    <option value="2">=</option>'
    + '    <option value="3">&gt;</option>'
    + '    <option value="4">&lt;=</option>'
    + '    <option value="5">&gt;=</option>'
    + '  </select> <input type="text" class="input-small" name="default">'
    + '  <button class="add">新增</button>'
    + '</div>'
    + '<hr>'
    + '<div class="form-inline pagination-centered">'
    + '  {{~it.actions :action:index}}'
    + '  {{? action.total }}<button class="total" path="{{=action.queryDefinition.path}}" dataAccessId="{{=action.queryDefinition.dataAccessId}}">{{=action.button}}</button><span class="uneditable-input hide"></span>'
    + '{{?? action.export }}<div class="input-append"><input class="input-medium" type="email" placeholder="{{=action.tip}}" required><button class="btn export" type="button" xaction="{{=action.xaction}}">{{=action.button}}</button></div>{{?}}'
    + '  {{~}}' + '</div>';
DataAnalysisExportTemplate = doT.template(DataAnalysisExportTemplate);
var DataAnalysisExportComponent = BaseComponent
    .extend({
      executeAtStart : true,
      update : function() {
        this.queryDefinition = this.schema;
        this.getValuesArray();
        this.ui.schemas = this.result;
        this.ui.defaultSchemas = [];
        var component = this;
        $.each(this.ui.schemas, function(i, obj) {
          if (obj[2]) {
            component.ui.defaultSchemas.push(obj);
          }
        });
        var dom = $(DataAnalysisExportTemplate(this.ui));
        var el = '#' + this.htmlObject;
        $(el).empty().append(dom);
        $(el + ' button.total').click(function() {
          component.queryDefinition = {
            path : $(this).attr('path'),
            dataAccessId : $(this).attr('dataAccessId')
          };
          component.getValuesArray();
          $(this).next().text('共' + component.result[0][0] + '条数据').show();
        });
        $(el + ' button.export').click(function() {
          var email = $(this).prev().val();
          if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email)) {
            alert('请输入正确的邮件地址');
            $(this).prev().focus();
            return;
          }
          var xaction = $(this).attr('xaction');
          var action = xaction.match(/[^\/]*\.xaction$/)[0];
          var solution = xaction.substring(0, xaction.indexOf(action));
          var cnd = [];
          $(el + ' .DataAnalysisExport_Schemas .control-group').each(function(i, obj) {
            cnd.push({
              name : $('input', obj).attr('name'),
              compare : $('select', obj).val(),
              value : $('input', obj).val()
            });
          });
          $.ajax({
            async : true,
            url : '/pentaho/ViewAction',
            data : {
              solution : solution,
              path : '',
              action : action,
              email : email,
              cnd : JSON.stringify(cnd)
            }
          });
          alert('请求已发送，请稍后查收邮件。');
        });
        var template = '<div class="control-group">' + '<label class="control-label">{{=it.label}}：</label>'
            + '<div class="controls">' + '<select class="input-mini">' + '<option value="1">&lt;</option>'
            + '<option value="2">=</option>' + '<option value="3">&gt;</option>' + '<option value="4">&lt;=</option>'
            + '<option value="5">&gt;=</option>'
            + '</select><input type="text" class="input-small" name="{{=it.name}}" value="{{=it.value}}">'
            + '</div></div>';
        template = doT.template(template);
        $(el + ' button.add').click(function() {
          var label = $(el + ' .DataAnalysisExport_Option select[name=label] option:selected').text();
          var name = $(el + ' .DataAnalysisExport_Option select[name=label]').val();
          var cond = $(el + ' .DataAnalysisExport_Option select[name=cond]').val();
          var value = $(el + ' .DataAnalysisExport_Option input[name=default]').val();
          var data = {
            label : label,
            name : name,
            value : value
          };
          var col1 = $(el + ' .DataAnalysisExport_Schemas .col1');
          var col2 = $(el + ' .DataAnalysisExport_Schemas .col2');
          var col = col1;
          if ($('.control-group', col1).length > $('.control-group', col2).length) {
            col = col2;
          }
          $(template(data)).appendTo(col.append()).find('option[value=' + cond + ']').attr('selected', true);
        });
      }
    });