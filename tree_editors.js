
	function tg_keydown ( p_e, p_tg, p_field /*, p_func*/ )  {
		
		switch(p_e.keyCode){
			case 13:	// enter
				if (p_e.target.className == 'panel datagrid easyui-fluid')  {								
					var row   = p_tg.treegrid("getSelected");
					var field = p_field;     //'working';
					var value = row[field];  //.working;
//					p_func ( p_tg, row, field, value);														
					tg_editor ( p_tg, row, field, value);																			
				}
				break;													
/*					
				case 38:	// up
					var selected = grid.datagrid('getSelected');
                    var id = selected.id;
					var root = grid.treegrid('getRoot');
					if (selected){
						var index = grid.datagrid('getRowIndex', selected);
						grid.datagrid('selectRow', index-1);
					} else {
						grid.datagrid('selectRow', 0);
					}
					break;
				case 40:	// down
					var selected = grid.datagrid('getSelected');
					if (selected){
						var index = grid.datagrid('getRowIndex', selected);
						grid.datagrid('selectRow', index+1);
					} else {
						grid.datagrid('selectRow', 0);
					}
					break;					
*/					
		}
	}		
	
	tg_editor_keydown = function (event)  {	// завершение редактирования и отправка данных на сервер
console.log(tg_editor_keydown);							
		var tg            = $(event.target).data ( 'grid'   );
		var id            = $(event.target).data ( 'id'     );
		var field         = $(event.target).data ( 'field'  );
		var key_dbfield   = $(event.target).data ( 'db_key_field'   );
		var value_dbfield = $(event.target).data ( 'db_value_field' );
		var dbProc        = $(event.target).data ( 'db_proc'  );		
		var func          = $(event.target).data ( 'load_func');					
		
		var value = event.target.value;
//			var value = event.target.value.replace('.',',');			
//				value = value.replace   (/[ ]/g, '');			
console.log(event);						
		if (event.which==13)  {
			event.preventDefault();
			var p_pars = new Object();				
				p_pars[key_dbfield]   = id;
				p_pars[value_dbfield] = value;					
			var url_ = 'qu_exec.php?command=' + dbProc /*liActivitySetWorking_insupd*/ + '&params_in=' + JSON.stringify(p_pars);			
			$.ajax({
				url:  url_,
				type: 'get',
				success: function (data)  {	
					data = JSON.parse(data);					
					console.log(data);
					if (data.result = 'ok')  {
						event.target.value = data[value_dbfield];
						tg.datagrid ( 'endEdit', id );																		
							
						o[func](id);
						tg.treegrid('getPanel').panel('panel').attr('tabindex',1).focus(); 
					}	
					else {	
						console.log('save : ошибочка вышла ! ' + data.error_code);
						alert('ошибка при записи формы : ' + data.error_code);						
						{ tg.datagrid('cancelEdit', id); }							
					}	
				},
				error:   function (data)  {	tg.datagrid('cancelEdit', id);   alert( "Network AJAX Error");   console.log(data.responseText); }
			});				
		}						

		if (event.which==27)  {
			event.preventDefault();
			tg.datagrid('cancelEdit', id);
			tg.treegrid('getPanel').panel('panel').attr('tabindex',1).focus(); 			
		}	
	}	
	
	function tg_editor (grid, row, field, value)  {	// закрытие открытых редакторов и вызов нового редактора в выбранной ячейке
		var id   = row.id;
		var cols = grid.treegrid('options').columns[0]; // no extra headers in my code
		var rows = grid.treegrid('getChildren');						
		for (var i=0;i<rows.length;i++) {					
			var selectedrow = rows[i];
			var rowIndex = grid.datagrid("getRowIndex", selectedrow);		
			grid.datagrid('cancelEdit', rowIndex);
		}				
//			for (var n=0; n<cols.length;n++) {
//				grid.datagrid('options').columns[0][n].editor=undefined;				
//			}	
		for (var n=0; n<cols.length;n++) {
			if (cols[n].field!==field) continue; // not found: continue
				if (field== field /*'working'*/)   // || (field=='sum_to_pay') || (field=='bank') || (field=='payment_num') ) 
//					if (o.f032_isGridEditField ( field ))
				{						    
					grid.datagrid('options').columns[0][n].editor='text';				
					grid.datagrid('beginEdit', row.id );						
					var ed  = grid.treegrid('getEditor', {index:row.id,field:field});																				

					$(ed.target).data ( 'grid',           grid   );														
					$(ed.target).data ( 'id',             row.id );							
					$(ed.target).data ( 'field',          field  );			 
					$(ed.target).data ( 'db_key_field',   'documentid' );			 
					$(ed.target).data ( 'db_value_field', 'comments'   );			 						
					$(ed.target).data ( 'db_proc',        'liActivitySetWorking_insupd' );											
					$(ed.target).data ( 'load_func',      'f15009_SetWorking_go' );
						
					$(ed.target).keydown ( function(event) { 		
							//o.f{sform_id}_grid_editor_keydown (event);
						tg_editor_keydown (event);							
					})						
					$(ed.target).focus();									
				}
			break; // no need to continue iteration
		}								
	}
	
	
	
/*
		o.f{sform_id}_grid_editor_keydown = function (event)  {	// завершение редактирования и отправка данных на сервер
			var grid  = $(event.target).data('grid');							
			var id    = $(event.target).data('id');									
			var field = $(event.target).data('field');		
			var value = event.target.value;
//			var value = event.target.value.replace('.',',');			
//				value = value.replace   (/[ ]/g, '');			
						
			if (event.which==13)  {
				event.preventDefault();
				var p_pars = new Object();
					p_pars.documentid = id;
					p_pars.comments   = value;
				var url_ = 'qu_exec.php?command=liActivitySetWorking_insupd&params_in=' + JSON.stringify(p_pars);			
				$.ajax({
					url:  url_,
					type: 'get',
					success: function (data)  {	
						data = JSON.parse(data);					
						console.log(data);
						if (data.result = 'ok')  {
							event.target.value = data.comments;
							grid.datagrid ( 'endEdit', id );																		
							
							o.f{sform_id}_SetWorking_go ( id ); 							 
							$('#{sform_id}_tasktree').treegrid('getPanel').panel('panel').attr('tabindex',1).focus(); 
//							o.f032_sf032_gridTotal();															
						}	
						else {	
							console.log('save : ошибочка вышла ! ' + data.error_code);
							alert('ошибка при записи формы : ' + data.error_code);						
							{ grid.datagrid('cancelEdit', id); }							
						}	

					},
					error:   function (data)  {	grid.datagrid('cancelEdit', id);   alert( "Network AJAX Error");   console.log(data.responseText); }
				});				
			}						

			if (event.which==27)  {
				event.preventDefault();
				grid.datagrid('cancelEdit', index);
			}	
		}		
*/	

/*		
		o.f{sform_id}_grid_editor = function (grid, row, field, value)  {	// закрытие открытых редакторов и вызов нового редактора в выбранной ячейке
			var id  = row.id;
			var cols = grid.treegrid('options').columns[0]; // no extra headers in my code
			var rows = grid.treegrid('getChildren');						
			for (var i=0;i<rows.length;i++) {					
				var selectedrow = rows[i];
				var rowIndex = grid.datagrid("getRowIndex", selectedrow);		
				grid.datagrid('cancelEdit', rowIndex);
			}				
//			for (var n=0; n<cols.length;n++) {
//				grid.datagrid('options').columns[0][n].editor=undefined;				
//			}	
			for (var n=0; n<cols.length;n++) {
				if (cols[n].field!==field) continue; // not found: continue
					if (field=='working')   // || (field=='sum_to_pay') || (field=='bank') || (field=='payment_num') ) 
//					if (o.f032_isGridEditField ( field ))
					{						    
						grid.datagrid('options').columns[0][n].editor='text';				
						grid.datagrid('beginEdit', row.id );						
						var ed  = grid.treegrid('getEditor', {index:row.id,field:field});																				

						$(ed.target).data ( 'grid',           grid   );														
						$(ed.target).data ( 'id',             row.id );							
						$(ed.target).data ( 'field',          field  );			 
						$(ed.target).data ( 'key_dbfield',   'documentid' );			 
						$(ed.target).data ( 'value_dbfield', 'comments'   );			 						
						$(ed.target).data ( 'func',          'f15009_SetWorking_go' );
						$(ed.target).data ( 'dbProc',        'liActivitySetWorking_insupd' );						
						
						$(ed.target).keydown ( function(event) { 		
							//o.f{sform_id}_grid_editor_keydown (event);
							tg_editor_keydown (event);							
						})						
						$(ed.target).focus();									
					}
				break; // no need to continue iteration
			}								
		}		
*/
